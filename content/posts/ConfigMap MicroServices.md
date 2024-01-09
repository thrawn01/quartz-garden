---
date: 2016-03-22T09:31:07-05:00
title: ConfigMap enabled Golang Microservices
tags:
  - docker
  - golang
  - kubernetes
  - cloud
---

The 1.2 release of Kubernetes added a new feature called
[ConfigMap](http://kubernetes.io/docs/user-guide/configmap/) which provides
mechanisms to inject containers with application configuration data.  Injecting
configuration files works great for most applications but the new ConfigMap
feature comes with the ability to not only provide an initial configuration
when the container starts, but also to update the configuration in the
container while it's running. In this post I'll show you how to write a
microservice to take advantage of the updated configuration and reconfigure
your service on the fly.
<!-- more -->

Lets look at what a simple web app that monitors for config file changes looks like.

```go
const CONFIG_FILE = "/etc/config/configmap-microservice-demo.yaml"
const BIND = "0.0.0.0:8080"

type Config struct {
	Message string `yaml:"message"`
}

func loadConfig(configFile string) *Config {
	conf := &Config{}
	configData, err := ioutil.ReadFile(configFile)
	check(err)

	err = yaml.Unmarshal(configData, conf)
	check(err)
	return conf
}

func main() {
	confManager := NewConfigManager(loadConfig(CONFIG_FILE))

	// Create a single GET Handler to print out our simple config message
	router := httprouter.New()
	router.GET("/", func(resp http.ResponseWriter, req *http.Request, p httprouter.Params) {
		conf := confManager.Get()
		fmt.Fprintf(resp, "%s", conf.Message)
	})

	// Watch the file for modification and update the config
	// manager with the new config when it's available
	watcher, err := WatchFile(CONFIG_FILE, time.Second, func() {
		fmt.Printf("Configfile Updated\n")
		conf := loadConfig(CONFIG_FILE)
		confManager.Set(conf)
	})
	check(err)

	// Clean up
	defer func() {
		watcher.Close()
	}()

	fmt.Printf("Listening on '%s'....\n", BIND)
	err = http.ListenAndServe(BIND, router)
	check(err)
}
```
The interesting parts of this app are the ``ConfigManager`` and the ``WatchFile``.

The ConfigManager's job is to provide access to our ``Config{}`` struct such
that a race condition does not exist when Kubernetes ConfigMap gives us a new
version of our config file and we update the ``Config{}`` object 

The WatchFile's job is to watch our config file for changes and run a call
back function which reads the new version of the config file and sets the new
``Config{}`` using the ConfigManager.

Lets take a look at the implementation of the ConfigManager.

```go
func NewConfigManager(conf *Config) *ConfigManager {
	return &ConfigManager{conf, &sync.Mutex{}}
}

func (self *ConfigManager) Set(conf *Config) {
	self.mutex.Lock()
	self.conf = conf
	self.mutex.Unlock()
}

func (self *ConfigManager) Get() *Config {
	self.mutex.Lock()
	defer func() {
		self.mutex.Unlock()
	}()
	return self.conf
}
```

Here we are using a simple Mutex to avoid the race condition. Typically you
want to avoid use of a mutex and use golang's built in channels. However since
the manager's job is to guard a single instance of a config object; using a mutex
is acceptable.

For the curious I created a golang channel implementation of this object and
ran some benchmarks. You can find the code and benchmark tests
[here](https://github.com/thrawn01/configmap-microservice-demo/blob/master/manager.go)
```
BenchmarkMutexConfigManager-8    3000000          456 ns/op
BenchmarkChannelConfigManager-8  2000000          958 ns/op
```
The Mutex version is very preformant with no risk of a deadlock.


The ``FileWatcher`` implementation is a bit more complex. Its goal is to insulate any
additional ``fsnotify`` events into a single update event so we only execute the
callback function once. The full code can be found
[here](https://github.com/thrawn01/configmap-microservice-demo/blob/master/watcher.go)

The interesting part is the ``run()`` function which executes within a go thread
and runs the callback function.
```go
func (self *FileWatcher) run() {
	// Check for write events at this interval
	tick := time.Tick(self.interval)

	var lastWriteEvent *fsnotify.Event
	for {
		select {
		case event := <-self.fsNotify.Events:
			// If we see a Remove event, we know the config was updated
			if event.Op == fsnotify.Remove {
				// Since the symlink was removed, we must
				// re-register the file to be watched
				self.fsNotify.Remove(event.Name)
				self.fsNotify.Add(event.Name)
				lastWriteEvent = &event
			}
		case <-tick:
			// No events during this interval
			if lastWriteEvent == nil {
				continue
			}
			// Execute the callback
			self.callback()
			// Reset the last event
			lastWriteEvent = nil
		case <-self.done:
			goto Close
		}
	}
Close:
	close(self.done)
}
```

You might think the code should be looking for ``fsnotify.Write`` events
instead of ``fsnotify.Remove`` however.... The config file that ConfigMap
presents to our application is actually a symlink to a version of our config
file instead of the actual file. This is so when a ConfigMap update occurs
kubernetes ``AtomicWriter()`` can achieve atomic ConfigMap updates.


Todo this, ``AtomicWriter()`` creates a new directory; writes the updated
ConfigMap contents to the new directory.  Once the write is complete it removes
the original config file symlink and replaces it with a new symlink pointing to
the contents of the newly created directory. 


Ideally the way our code should handle this would be to monitor our config
file symlink instead of the actual file for events. However ``fsnotify.v1`` does
not allow us to pass in the ``IN_DONT_FOLLOW`` flag to ``inotify`` which would allow us
to monitor the symlink for changes. Instead ``fsnotify`` de-references the symlink
and monitors the real file for events. This is not likely to change as ``fsnotify``
is designed as cross platform and not all platforms support symlinks.

I continue to use the ``fsnotify`` library because it's convenient for me to develop
on osx and deploy in a container. Linux centric implementations should use the
``"golang.org/x/exp/inotify"`` library directly.

Now that we have our code, We can create a docker image and upload it to docker
hub, ready for deployment in our kubernetes cluster.

```Dockerfile
FROM golang

# Copy the local package files to the container's workspace.
ADD . /go/src/github.com/thrawn01/configmap-microservice-demo

RUN go get github.com/julienschmidt/httprouter
RUN go get gopkg.in/fsnotify.v1
RUN go get gopkg.in/yaml.v2
RUN go install github.com/thrawn01/configmap-microservice-demo
ENTRYPOINT /go/bin/configmap-microservice-demo

# Document that the service listens on port 8080.
EXPOSE 8080
```

Assuming you already have a kubernetes cluster up; ( I use vagrant ) Lets walk
through creating a ConfigMap configuration and consuming it with our container.

### Creating the ConfigMap

First we create a ConfigMap manifest file

```bash
$ cat kubernetes-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: configmap-microservice-demo
  namespace: default
data:
  configmap-microservice-demo.yaml: |
    message: Hello World
```
This defines a new configmap called ``configmap-microservice-demo`` that includes
``data:`` with the name of the config file ``configmap-microservice-demo.yaml``
and it's contents ``message: Hello World``.

Create the ConfigMap using ``kubectl``
```bash
$ kubectl create -f kubernetes-configmap.yaml 
configmap "configmap-microservice-demo" created
```

You can inspect the newly created ConfigMap
```bash
$ kubectl describe configmaps
Name:		configmap-microservice-demo
Namespace:	default
Labels:		<none>
Annotations:	<none>

Data
====
configmap-microservice-demo.yaml:	21 bytes
```

Next we define a ReplicationController manifest file to run our application container

```bash
$ cat kubernetes-rc.yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name: configmap-microservice-demo
spec:
  template:
    metadata:
      labels:
        app: configmap-microservice-demo
    spec:
      containers:
        - name: configmap-microservice-demo
          image: docker.io/thrawn01/configmap-microservice-demo
          ports:
            - containerPort: 8080
          volumeMounts:
          - name: config-volume
            mountPath: /etc/config
      volumes:
        - name: config-volume
          configMap:
            name: configmap-microservice-demo
```

The interesting bits are the ``volumes:`` and ``volumeMounts:`` which tells the
kubelet running on the node about our ConfigMap and where to mount our config
file. When our container runs; the volume plugin will mount a directory called
``/etc/config`` within our container and place our config file
``configmap-microservice-demo.yaml`` within. The final full path of our config
file from our containers point of view will be ``/etc/config/configmap-microservice-demo.yaml``

Now lets create the ReplicationController
```bash
$ kubectl create -f kubernetes-rc.yaml
```

We can now inspect our running pods to find the IP address of our new pod
```bash
$ kubectl get pods -l app=configmap-microservice-demo -o yaml | grep podIP
    podIP: 10.246.70.8
```

Now if you log into one of the nodes in our cluster, we can hit our application
from anywhere in the cluster using the pod ip address. 

```bash
[root@kubernetes-node-1 ~]# curl http://10.246.70.8:8080
Hello World[root@kubernetes-node-1 ~]#
```

If this part is confusing you may find [this blog post](http://www.dasblinkenlichten.com/kubernetes-101-networking/) instructive
as it does a deep dive into how kubernetes networking works. Also there are the
official [docs](http://kubernetes.io/docs/admin/networking/)

### Updating the ConfigMap
Now for the fun part, lets update our config and deploy the change to the ConfigMap

Lets open the original configmap manifest file and change our ``message: Hello
World`` to ``message: Hello Grandma``
```
$ vi kubernetes-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: configmap-microservice-demo
  namespace: default
data:
  configmap-microservice-demo.yaml: |
    message: Hello Grandma
```

Replace the current ConfigMap with our updated version
```bash
$ kubectl replace -f kubernetes-configmap.yaml
```

We can verify the update was successful by performing a ``get`` on the ``configmap`` resource
```bash
$ kubectl get configmap configmap-microservice-demo -o yaml
apiVersion: v1
data:
  configmap-microservice-demo.yaml: |
    message: Hello Grandma
kind: ConfigMap
metadata:
  creationTimestamp: 2016-03-20T19:26:34Z
  name: configmap-microservice-demo
  namespace: default
  resourceVersion: "8871"
  selfLink: /api/v1/namespaces/default/configmaps/configmap-microservice-demo
  uid: a8418071-eed1-11e5-9aae-080027242396
```

Our app should soon get the updated config, we can verify this by looking at the log
```bash
$ kubectl get pods
NAME                                READY     STATUS    RESTARTS   AGE
configmap-microservice-demo-5zkyx   1/1       Running   0          1m

$ kubectl logs configmap-microservice-demo-5zkyx
Listening on '0.0.0.0:8080'....
Configfile Updated
```

Now we can curl our application from within the cluster, and we should see the
updated config reflected in our application.
```bash
root@kubernetes-node-1 ~]# curl http://10.247.85.119
Hello Grandma[root@kubernetes-node-1 ~]#
```

For the industrious you can log into the node our container is running and
inspect the config file directly. Kubernetes mounts the directories in
``/var/lib/kubelet/pods/<pod-id>/volumes/kubernetes.io~configmap/config-volume``

The complete code is available [here](http://github.com/thrawn01/configmap-microservice-demo)

