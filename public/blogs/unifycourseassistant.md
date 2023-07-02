---
date: 07/02/2023
title: UNIfy - Course Assistant
tags:
- projects
authors:
  - Kunal Pai
  - Parth Shah
  - Harshil Patel
  - Keshav Agrawal
image: /images/unify.png
---

## Inspiration

What is the single biggest issue that we face as undergraduates living off-campus? Resoundingly, in our group, we answered, "finding classes coherently and meeting new people in classes". We feel that after the pandemic, we had lost touch with the campus and we had forgotten how campus life works. A student needs to have classes that are nearby, not only in timings but also on foot. Couple that with the urge to take classes with friends or with people we know. Sounds like a lot of work and a lot of stress, doesn't it? This is exactly what we solve.

## What Does It Do?

UNIfy Course Assistant is a suite of tools that help you along the way in a college quarter. Starting with registering for classes, it helps you plan out a schedule and visualize your journey on campus every day. Our tool automatically creates the map and the calendar for you, which can be exported easily. Our tool connects with your Discord account, and our Discord bot helps you out with course groups, course reminders, and other general tools. We created a vanilla recommendation system that recommends other people based on the classes you have taken using a matching algorithm from other users' classes. Using this, you would be able to match with students who have or are currently taking classes similar to you. Once a course commences, we help you find a Discord link where you can meet other people and make friends. We have used RateMyProfessor, a very common tool that people use, for the course and professor evaluations.

## How We Built It

Our project is a combination of many individual components that are stitched on a React website. We created a Discord bot that helps out with main tasks on the website and user's daily life on Discord. The Discord bot uses the Discord API and databases that we have created by scraping websites like RateMyProfessor. Additionally, we create multiple components like the calendar using React.js, maps using the Google Maps API, and a database on SQLite. We have created our own recommendation tool that uses a combination of the same classes and similar classes to what you've taken to help you meet people with common interests.

## Challenges

One of the toughest challenges was to get the Google Maps API to work and create a Discord bot since we had no experience doing that. Apart from that, there were no public APIs for RMP, and getting courses, thus we had to create our own web scraper to fetch the courses for our database.

## Demo Video

<div>
<div class="lists">
    <iframe width="100%" height="420px"
    src="https://www.youtube.com/embed/Ax1v-L-QEtA">
    </iframe>
    </br>
    </br>
</div>
</div>

## Code

<a href="https://github.com/helloparthshah/UNIfyCourseAssistant">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
</svg>
GitHub
</a>