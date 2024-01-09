import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/thrawn01/quartz-garden",
      Twitter: "https://twitter.com/thrawn01",
      Medium: "https://medium.com/@thrawn01",
      Linkedin: "https://www.linkedin.com/in/thrawn01"
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "Recent Posts",
        limit: 4,
        filter: (f) =>
          f.slug!.startsWith("posts/") && f.slug! !== "posts/index" && !f.frontmatter?.noindex,
        linkToMore: "posts/" as SimpleSlug,
      }),
    ),
  ],
  right: [
    Component.NavList({
      title: "Site Map",
      links: [
        {
          name: "About Me",
          url:"/about"
        },
        {
          name: "All Blog Posts",
          url:"/posts"
        }
      ]
    }),
    Component.NavList({
      title: "Links",
      links: [
        {
          name: "Linkedin",
          url:"https://www.linkedin.com/in/thrawn01"
        },
        {
          name: "Github",
          url:"https://github.com/thrawn01"
        },
        {
          name: "Medium",
          url:"https://medium.com/@thrawn01"
        },
        {
          name: "Twitter",
          url:"https://twitter.com/thrawn01"
        },
      ]
    }),
    Component.DesktopOnly(Component.TableOfContents()),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
  ],
  right: [],
}
