---
layout: post
title:  Leadership and building software
tags: [leadership]
---
  
##### Learning to write software
I started writing software at a DNA testing lab. I crafted user stories directly with the lab technicians by spending time with them while they were using the software. I worked with technicians and watched their workflow as the navigated the lab and used the software to track specimens. I was naive in terms of software development and software development practices. I had not heard of agile or waterfall I just knew that I was paid to help the people in the lab. I would walk down to the lab and talk with the lab technicians, take notes and try to understand the problems they were dealing with. Sometimes I just needed to fix a bug, other times I was reworking an entire lab step. I built feedback into every day by iterating with each technician (stakeholder). I didn’t know what I was doing in terms of process, I just knew that I needed to make sure what I was trying to build fit their needs. I have since started to learn more about software development processes and I can now see that I was trying to deliver value as fast as possible to help my “client” by iterating quickly. This was a great way for me to learn what software development is all about.

I was starting to become a decent engineer, but I did not have to ability to change my software rapidly. I made changes that rippled through the system and caused side effects in parts of the system I could have never predicted. This was partially my fault due to a poor understanding of the design a lack of tests and I was a little bit of a victim of the previous engineers. These issues made me wonder if I was a good engineer. I was learning that the mistakes I was making were easy to avoid with “good” software. So after trying to learn how to write good code on my own, I decided I wanted to join a company that cared about their “code quality”. This was what I started to think was the most important skill - creating software that was beautiful or something...

##### Writing `good` software
I started working at a larger company because I wanted to immerse myself in “real” software development. I felt that the lab I was working in was missing a lot of the practices I needed to learn. The new system I was working on was built in 2006 and had not adapted to the times, it was stuck in a pattern and took a ton of configuration for each client that used it. The application was clunky and difficult to work with, but we had a newer team and this group was ready to do “the rewrite”. We saw that we could make architectural decisions that needed to be made this time. Now that we had all the information we needed from the last 15 years of business. 

##### Refactoring?
The director had built the system from the ground up the first time and we knew how we were going to make it right this time.  We started a new application rewrote some of the backend and even unit tested some of it. Things were moving great until we realized how much about the old system we would have to know to create something that would be a full replacement. The company spent years trying to figure out how to make this new product while still managing to keep the old `pile of junk` alive. The problems that we were trying to solve had been solved years ago just in imperfect ways. They did not have all the information we had now. The trouble was we didn’t know how all of the pieces interacted so we could not recreate the system in our preferred way. This was compounded by a lack of tests that did not enable green to green refactoring. We were often left wondering how module A created a side effect in module F. 

We spent so much time trying to figure out how to rewrite the system we did not keep up with clients needs and even our own needs. Hours and hours were spent configuring the system and manually testing the setups. We could not spend the time to rewrite the application because we had to spend our time fighting the system. When I look back I can see two main reasons we were struggling.

The first reason we struggled was that we didn't have any tests around the system. We had to manually test all the changes we made which was so time-consuming we couldn’t make the changes we wanted to make. Instead, we had to make small code changes and wait for a deploy to get feedback from the whole system. Simple selenium tests could have really helped show this type of regression in the system. Although selenium tests are slow we could have set up tests to ensure the basic health of the system. In addition to a lack of tests, the tests that were written were not effective. This is a huge issue in my experience, people just simply do not know how to write useful tests. Many tests get “in the way” because they are testing implementation details not the behavior of the software. I did not have the know-how and the experience to write solid tests that move the software forward. 

##### Dealing with legacy code
Legacy code is only difficult to work with when it needs to be changed. If we were able to separate the new features from the old system we would have been able to use layers of abstraction to incrementally rewrite parts of the system that made sense. This would give us the ability to effectively test new parts of the system with test coverage. I was told that testing the application was impossible to test and not worth the effort, I can now see that it was far from impossible and vital to the success of the company. So instead we looked for a total rewrite which was just too daunting of a task and led to analysis paralysis. 

##### Empower others to go fix it
The next issue was a lack of empowerment from leadership. The engineering director was in charge of managing releases, prioritizing features, writing code and a touch of people management. The director was a great person and was always helpful but he was always busy. I can now look back and see that many of the tasks he was doing could have been taken care of by engineers and product managers if they felt empowered to do so. He had been at the company for 20 years and had been the point of the application for so long he did not let go of those responsibilities that he felt empowered to take at one time. 

Directors are in my opinion are meant to help the organization move forward. To me, that means filling the needs of engineers and pushing them to do what they see is best for the end users of the software. I did not feel a strong connection with the clients' needs because I could not impact their lives. I was doing the work that was given to me and I had no say in how something worked or why it was supposed to work that way. I was not encouraged to help think through their needs or alternative solutions. My ideas of helping clients could have ranged from putting in place testing frameworks, making process changes or to rework how we configured the system. Each idea was directly related to the work I was doing every day but I felt that I could not “waste time” on these extra activities. Slack time can seem like a waste of time, but when people are given the ability to change something, their interest and desire to contribute increases drastically. 

How does an organization get its engineers to care about the value they are delivering and not how "good" their software is? You have to empower your engineers to be the owners of the product. If leadership is making all the decisions on how the software should be developed what technologies should be used then engineers are left to care about the smallest details of the internals of the code. That is the only thing they have control over. Instead, if leadership is able to point their focus on leveling up the employees, making great hires and empowering people to make the decisions that will drive value your engineers will thrive. 

##### What does empowerment look like to me? 
> 
1) Talk to your employees every day. Make sure you give them an opportunity to express issues. Ask specific questions to give them more chances to talk about uncomfortable topics. 

2) Get your team involved in decisions and invested in the mission. There is no better way to lose your teams' interest than to decide everything up front.  Agile is about iteration so first off iterate, but second, ensure that your engineers are part of that process. If the iteration only occurs within the software creation, it is not agile. 

3) Help your engineers understand the domain they are working in. Most engineers are not experts in the domain they are working in but they have the ability to understand just enough. Just enough does not make a great experience for the end users.

4) To become a software company that continually brings value to clients and employees you must provide mentorship leadership and career path changes. This means you have to spend time not writing features to deliver more value. The cost of losing an engineer is larger than getting a few more hours of work out of them. 

5) Give your team leadership opportunities. People want to grow their career and many places do not give you the chance to move up and move around. Many people are forced into a new position to find the growth they want. Keep your team's domain knowledge and focus on internal growth. You will see a better product. 

6) Mentor younger engineers give them the chance to work closely with senior engineers. Give them the tools to make mistakes safely and grow. 

7) A coaching program is really valuable for younger engineers and more senior engineers can gain experience in leadership. 

8) Understand why you want to use new technology. React, Angular or any front-end framework is only useful if you need frontend validations and feedback. Build with value in mind, not technology. End users do not care about your server-side rendered react if they can’t do their job. 

9) Bring empathy to your everyday. To other engineers, QA, product and the client. It will make a difference in job satisfaction. It’s great being a part of a stress-free place where you can focus on work and not on personal issues. People will follow leadership in this.

10) You only try with the things you can control. If you feel like you can not impact your clients or your processes you will not care about them. People will look to change what they can, empower them to do what they are good at. Leaders should focus on empowering and do not try to take care of the little things. If you have good people they will do them for you and much more effectively. 

11) “Friday project time” holds an immeasurable value in my opinion. Learning time helps keep engineers longer, learn new skills and use them right away. If you are lucky you might even see engineers build out features in your application during their free time. The features will be built because they see the value and want to deliver it, this is all enhanced by the fact that it is self-motivated.

>
