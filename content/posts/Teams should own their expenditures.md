---
tags:
  - cloud
  - leadership
  - teams
date: 2024-03-19
---
This is a rehash of the old, `give teams ownership` thingy, but this isn't just a tagline in a hand book. We are talking about allowing teams to own the cold hard cash that it costs to run their product. For the remainder of this post, I assume your team owns the product they work on, if that isn't you, then you have other things to read. See [Building High-Performing Product Teams](https://romanpichler.medium.com/building-high-performing-product-teams-cc9510f84530) and [5 Benefits Product Teams have over Technology Teams](https://www.rebelscrum.site/post/5-benefits-product-teams-have-over-technology-teams)

  >With great power, comes great responsibility

Contrary to the opinions of the skeptical, if you build an autonomous team, provide them access to their price tag, they will become even more responsible, and be even more engaged in controlling costs than you might expect.

We had a team at Mailgun, which had a problem. Everyday around the same time, a very large customer would completely saturate all of their write throughput capacity. The generic solution of permanently scaling up persistent data stores to accommodate the once a day spike in write throughput was sub optimal, as running those additional data stores cut deeply into the infra expenditures. In addition, it didn't make sense to run in a cloud environment and not take advantage of the ability to scale up and down when that extra capacity was no longer needed. See [[You don't know how to Cloud]]

In a normal team, with zero visibility into their infra costs, this would have been very one sided, `We need X number of new disks and database clusters, else, you get very unhappy customers.`

But with visibility into the expenditures the team incurred, the team had the freedom to experiment with and iterate on several different solutions which would allow the team to deal with the additional write throughput on demand. They built dashboards which provided real time cost estimation for a few hosted data storage solutions to off load write capacity during peak hours.  They worked closely with the infra team, experimenting with different cluster configurations, cost estimations, and performance of each solution. Evaluated different storage technologies and techniques to identify which would give the best bang for their buck.

Although leadership was very much involved, these experiments and associated metric collections were driven by the team. Truly owned by, and driven by the team. If the initiative were to be owned by an outside team, oversight, or product initiative, the creativity employed in searching for and collecting metrics to find a solution would not have been as rigorous or complete.

Giving ownership to the team, a true sense of ownership, the ownership that says the team as actual skin in the game, and their hard work would result in an efficient and performant solution was highly gratifying to the team, and the financial benefits are reaped by both the team, and leadership.
