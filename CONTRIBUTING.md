# Guidelines for Contributing to alphaTab. 

I am happy that you are interested in alphaTab and want to contribute by entering bugs, feature requests, asking questions or even contribute code. Please play with the rules. It's not only about what you say, but also how you say it. Playing nice increases the chance of getting features/bugfixes faster :wink: Remember that everything you get here is for free and in the end it's about giving and taking. 

## Discussions vs Issues

We consider the issues our concerete work backlog. That means any item there should be on a quality level that it allows working on a topic.
Discussions are more a playground for talking about ideas, features or problems before we actually derive a work item from it. 

Here some guidance which might help you deciding whether to open a issue or a discussion post: 

Open a Discussion if: 
* You have an idea about a new feature you know alphaTab does not have yet.
* You need support in using alphaTab.
* You are not sure if alphaTab can do something you need it to do.
* AlphaTab does not behave as you would maybe expect it to behave, but you aren't yet sure if alphaTab or your usage is the problem cause. 

Open an Issue if:
* You found a very obvious bug that something is not working. You can reproduce the issue and provide us the info how we can also reproduce it. 
* You found that something is missing on an existing feature and you want to have it extended.

## When entering an issue

**Please follow the provided templates when entering issues. It is crucial to provide the asked information to reduce the effort on our side to handle all the incoming requests. We see a strong tendency of people not providing the asked information and we need to make multiple rounds to find out first what's happening on their side. It should be possible for every developer to take 2 additional minutes of time to enter issues in a proper structured way and by this reduce a multiple of this time on our side.**

**We will close issues not following the template or clean structure without further discussion.**

Beside that: 

* Check if your topic has already been covered. Use the search function and respond to an existing issue instead of opening a new one if you find a match. 
* Double check you are using the right template. We get a lot of feature requests or bug reports as via the question template. If something is not yet available or not working, it is very likely not a question but rather a missing feature or misbehavior. 


## Contributing Code

Code changes can be offered by opening pull requests. To do so, we recommend following workflow: 

1. Start with [forking](https://docs.github.com/en/get-started/quickstart/fork-a-repo) this repository. 
This way you get a copy of our repository in your account where you can work.
2. Create a new feature branch starting from `develop` on which you add your changes. 
We recommend branch names like `feature/<feature-name>` (e.g. feature/alphatex-alternate-endings) or `feature/<issue-number>` (e.g. feature/issue-1234).
3. If you have your changes ready, [open a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) against the main repository.
This way you make your changes visible to us. Be sure to fill out the template. 
4. When you think your pull request is not yet fully ready, mark it as a [draft pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests#draft-pull-requests). 
5. As soon you think your changes are ready, clear the draft state. This way it should become visible on our side for review. 
6. We will then review the code, and ensure that the CI system builds and runs your changes. 
7. We might ask for changes to the code style or feature depending to fulfill our guidelines and needs. 
8. If everything goes well, we will approve the change and merge it into the product. 
9. Once we will release a new version, we will of course mention you als contributor of the particular bugfix or feature ;)

If you are new to contributing to Open Source Projects on GitHub you might read through some articles in the web. The principle is usually always very similar, projects just might have different rules to follow. 


https://docs.github.com/en/get-started/quickstart/contributing-to-projects
https://opensource.com/article/19/7/create-pull-request-github
https://www.freecodecamp.org/news/how-to-make-your-first-pull-request-on-github-3/