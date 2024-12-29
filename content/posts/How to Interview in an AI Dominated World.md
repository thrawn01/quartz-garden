---
tags:
  - programming
  - education
  - leadership
  - thoughts
date: 2024-12-04
---
### Doing it Wrong

I recently completed an assessment for a position, and the very first question on the assessment was to solve a mathematical word problem. My immediate thoughts were: 
- How does this problem help them decide if I'm the right candidate for the job?
- Is this the sort of problem I can expect to solve on a daily basis?
- How do they know I'm not asking ChatGPT for the answer?

This type of interview assessment is typical of developers asked to perform an interview, but who have little experience doing so. Many of them assume they have found a clever way to weed out non-programmers, as their assumption is "any programmer can solve this problem; if you can't, then you are not a programmer". There are two major issues with this line of interview questioning:

- You are likely eliminating talent diversity
- AI likely knows the answer to your novel question
#### Eliminating diversity of Talent
The result of applying these types of assumptions to all candidates is a sure way to eliminate a wide array of diverse talent. These questions essentially boil down to an assumption that "Everyone who can answer this question has had similar educational experiences or work background as I have." Applied broadly to every candidate, this is a false assumption and can lead to the loss of a significant amount of top talent. Instead, you need to tailor questioning to the specific position you are hiring for.

If you are interviewing for a team that routinely solves novel math problems as its main occupation, asking the candidate to solve a mathematical problem is extremely useful. For instance, you should assume anyone who joins a team developing a database product must have a basic understanding of what a binary tree is, what an LSM is, SSTables, filter algorithms, etc. However, you should NOT expect a candidate building UI experiences to know what those things are, or to implement a bloom filter algorithm as a programming test!

You can't even apply "every backend developer should know X" as backend development has so many deep specialization niches: networking internals, kernel internals, disk, cloud, the list goes on. Many in those specializations have never solved a novel math problem or traversed a binary tree in their life!

There are no clever "If you can solve this, you are a programmer" style problems you could give without alienating niche talent. Programming in the modern age is so diverse, with so many specializations, that there is no "one size fits all" question you could ask. Not to mention a world where the advent of AI provides access to all of those specializations to the fingertips of anyone on the planet.

### Ask Questions ChatGPT cannot answer 
In today's AI-dominated landscape, artificial intelligence systems possess knowledge of any technology sub specializations,  and all coding challenge solutions traditionally used by major corporations in their hiring processes. As a result, the practice of using these technical  assessment is greatly diminished.

A better solution is to instead ask in interview questions which revolve around a few main threads which ChatGPT can't answer.
### How to do coding assessments correctly
The first thread is understanding coding ability. In general 70-80% of developer time is spent debugging and maintaining code, fixing production problems, and removing technical debit. If your technical assessment includes building a toy project, or solving a novel problem, where the candidate is ONLY writing NEW code, your assessment is only evaluating a tiny part of what a developer does on a daily basis.

A few questions every candidate needs to answer.
- What is the candidate's debugging process?
	- Give the candidate an actual problem you've had, ask them how they would go about diagnosing the issue. 
	- What questions do they ask to get closer to the solution.
	- Will the candidate give up if the answer eludes?
		- Give the candidate feed back on questions asked
		- Do they give up half way, or are they driven to ask more questions to find the answer.
- Ask the candidate to relate a diagnosis of a problem they solved in the past.
- Does the candidate ever say "I don't know" and ask for help? -- This is a good thing, consider this an offer to collaborate and offer suggestions.
- What is the longest you've worked on and maintained a single project?
	- What do you wish you could change about that project?
- How well does the candidate collaborate with others to diagnose and solve problems?

#### Collaborate during the interview
That final question is of particular note, as a lot of what developers do on a team is work together. The best way to get a sense of what it's like to work with the candidate is to ACTUALLY COLLABORATE together during the interview. You don't want anything too complex, just a problem you can work on together for 10-20 minutes to get a feel for what it's like to collaborate with the candidate. Ideally, the collaboration occurs within the realm of the position you are hiring for, at a minimum, in the language the candidate will be using on the team.

For example, here I've created a snippet of golang code and decidedly did the worst possible things I could imagine. It's intended to be light hearted, and fun, with some very obvious fixes. I always have a list of all the possible fixes on my screen before I start, and I check off all the ones identified by the candidate. I also check off issues the candidate fixed, but might not have verbally identified. I call this non verbal fixing, "intuition" as the candidate might not really know it's wrong, but it just "feels" wrong to them, so they fix/improve the code as they go. The candidate should be encouraged to completely rewrite the function as they see fit. Along the way, I will throw out good and bad suggestions on fixes, and see how the candidate reacts.

```go
func main() {  
   s := make(chan bool, 10)  
   var result map[string][]int  
  
   for i := 0; i <= 100; i++ {  
      s <- true  
      go func() {  
         // /integers endpoint returns `{ "value": 2 }`  
         resp, err := http.Get("<https://">+domain+"/integers/"+fmt.Sprint(i)))  
         if err != nil {  
            panic(err)  
         }  
  
         var p map[string]interface{}  
         err := json.Unmarshal(resp.Body, &p)  
         if err == nil {  
            panic(err)  
         }  
  
         if isEven(p["value"].(int)) {  
            result["even"] = append(result["even"], p["value"].(int))  
         } else {  
            result["odd"] = append(result["odd"], p["value"].(int))  
         }  
         <-s  
      }()  
   }  
   // TODO: Print out `result`  
}

func isEven(input int) bool {
	switch input {
	case 0:
		return true
	case 1:
		return false
	default:
		return isEven(input - 2)
	}
}
```

I've had such a great time collaborating with many interview candidates over the years solving this little snippet of code. The beauty of this problem is that it's not something that chatGPT can "solve" easily, and again the point isn't to "solve" the problems, it is to "collaborate" together in solving them.

Here are some of the solutions that candidates could "fix", I'll leave the others as an exercise for the reader. There are many... 😁
- `resp, err := http.Get("<https://"> + domain + "/integers/" + fmt.Sprint(i)))` additional closing parenthesis.
- The variable `domain` is never defined
- You can’t pass `resp.Body` to `json.Unmarshal`
- There is a much easier way to calculate `isEven()` 
- Prefer `fmt.Sprintf("https://%s/integers/%d", domain, i)` to string concatenation.
### The Ability to Learn and Improve
The second aspect is to understand how the candidate learns and improves. No matter the age or experience, everyone is constantly learning. Much like a tree dies when it stops growing, so a programmer who is not learning, and improving will also figuratively dies, as their skills, out date themselves.

- What book have you recently read, and what did you learn from it?
- What new thing have you learned recently?
- Where do you go to learn new things?
	- Slack, Discord, Community Groups?
	- Stack Overflow, Hacker News, Podcasts?
		- What is a recent article you read, and what was your take away?
- How have you integrated AI into your programming workflow?
	- Has it made you more or less productive?

### Skills relative to the job
The next thread is very specific to the position and the candidate, but there are a few high level things every candidate should answer. 

- Have you ever worked in this field?
- What is your experience working with X? Did you like it?
- If you could use X or Y, Z would you choose X? Why or Why not?
- What are the pros and cons of using X 

If the candidate can't give you a con, it's a smell they don't actually know much about the thing, as there is no such thing as a "perfect" solution, there is always a con to every pro.
### Get them to talk about themselves
People in general love talking about themselves and about things they know and are passionate about. Often what they are passionate about isn't directly related to the position, but are adjacent. Teasing out those passions or topics can give you insight, or lead to the candidate gushing and opening up about a work experience.

- What do you enjoy doing in your off time?
- Do you have any hobbies? (Games, Crafts, Social Media Doom Scrolling!?!?!?)

If the candidate is expected to work on internet technologies like HTTP, Web Services, Web UI, I like to ask the following question.

- What happens when I type `google.com` into a browser address bar and press ENTER?

This is a deliberately open ended question, as the candidate can go as shallow or as deep as they wish. They could talk about Keyboard Codes, USB ports, Device Drivers, DNS, HTTP, Proxies, Network Switches, or on the Browser side, DOM loading, Javascript, HTML Components! oh MY!

You can and WILL jump off into all sorts of directions from this single question, especially if you hit upon some part of the stack the candidate is particularly knowledgeable and passionate about.
### Communication Skills
Another aspect is that of people and communication skills. Often the super power of a candidate isn't in deep technical knowledge, but the power to understand and convey that knowledge to others via documentation, group settings, or the ability to keep other developers on topic. Having a developer who is the "glue" or "technical interpreter" on a team full of technical depth can be an asset.

- Describe a time when a technical decision couldn't be agreed upon.
	- What was the outcome?
- Describe a situation where you mentored another developer
- Describe a situation where you mediated a difficult situation?
- How do you deal with difficult people?
- How do you deal with technical one up man-ship in groups or Pull Requests?
### Wrapping it up
Now, in some cases, when all of the above fails, you come up short, and don't feel like you are getting enough from the candidate. In desperation, you can ask 

- Is there anything we've not talked about, which you would like to share, that shows you at your best?

FINALLY, Always leave time at the end for the candidate to ask their own questions.  
### Candidate Questions
For all the candidates out there. Here are a few good questions to ask during an interview.

- What is your release process like -- gives you hints about SDLC, perhaps it's actually Agile Waterfall?
- How efficient are you at developing software?
	- How many times a day do you deploy?
		- Low deploy cycles times indicate heavy process or other internal problems
	- When was the last time you deployed on Friday?
		- Not deploying on Friday gives you a good hint about how confident they are in the software they release.
- Have you read the [Accelerate](https://a.co/d/3Ap6dQC) book and practiced its advice?
	- EVERYONE SHOULD READ THIS BOOK BTW!!!!
- What is one thing you would change about your job?
- What is the PR review culture?
	- Would you say PR reviews are a positive experience?
	- How long do PRs hang around for?
- What is your testing culture like?
	- Do you prefer Functional, Unit, Integration Testing?
- What sort of observability tools are you using
	- Metrics, Logs, Tracing?
* If you were to hire me right now, how best would you utilize my skill set? -- This question stolen from [Pirate software](https://www.youtube.com/@PirateSoftware)
- As a company, What's your unfair advantage?
- Give a recent example of your company culture?
- If you had a really great day at work and you're telling your partner all about your day. What is it that you're telling them?
### Conclusion
Very few of these threads or aspects are things that an AI can give good answers on. This is because you are not asking esoteric problems that the world has already solved.

Finally....

Before I wrap up, I need to mention that there are two classes of developers you are looking to attract. The first group are senior developers, the second are junior to mid level developers. One group is smaller, and in higher demand, the other is larger and is in less demand.
#### Senior Developers (or Rock Stars)
The best way to pass on a rock start developer (if such a thing actually exists) is to require an up front project which takes hours or days to write. For senior positions, you don't want to gate the candidate with an assessment, instead opt for a quick 10 min chat, or email/instant message chat with the hiring manager. If the senior dev is good, they will have some publicly available code or projects they could submit showing their work.
### Mid to Junior Developers
This is a big pond, you really want to cast a big net, but weed through the candidates quickly. Often juniors and mid levels will apply to everything twice just to get a chance. In this case, an assessment might be useful, but likely more useful and entertaining to the developer is requesting an advent of code project, or some other coding challenge they have participated in. 

Your other option is to hire a third party assessment company to help weed through the sea of fish. If you do decide to ask for a code assessment, you had better expect that assessment to be written at least partially by an AI and judge accordingly. Most modern engineering organizations expect their job developers to use AI to accelerate their velocity, as such, you should also expect interviewing developers to ALSO use AI when submitting their assessments. You could even ask for the prompt transcripts to see what sort of prompt engineering the candidate is capable of. 

The AI world is here, and its not going any were, complaining about it won't help, we must adapt.