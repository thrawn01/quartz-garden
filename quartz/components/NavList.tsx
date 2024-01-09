import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/backlinks.scss"
import { GlobalConfiguration } from "../cfg"

interface Link {
  name: string
  url: string
}

interface Options {
  title: string
  links: Link[]
}

/*links: [
  {
    name:"Google",
    url:"https://google.com",
  },
  {
    name:"Posts",
    url:"posts/",
  },
]*/

const defaultOptions = (cfg: GlobalConfiguration): Options => ({
  title: "Navigation",
  links: [],
})

export default ((userOpts?: Partial<Options>) => {
  function NavList({ fileData, allFiles, displayClass, cfg }: QuartzComponentProps) {
    const opts = { ...defaultOptions(cfg), ...userOpts }
    return (
      <div class={`backlinks ${displayClass ?? ""}`}>
        <h3>{opts.title}</h3>
        <ul class="overflow">
          {opts.links.length > 0 ? (
            opts.links.map((f) => (
              <li>
                <a href={f.url} class="internal">
                  {f.name}
                </a>
              </li>
            ))
          ) : (
            <li>No links found</li>
          )}
        </ul>
      </div>
    )
  }

  NavList.css = style
  return NavList
}) satisfies QuartzComponentConstructor