# MagicSnap

<p align="center">
  <img src="https://raw.githubusercontent.com/kcoderhtml/magicsnap/refs/heads/main/public/android-chrome-512x512.png" alt="screenshot of the website"/>
</p>

<p align="center">
  A modern, easy to use, and open source team management software
</p>

## About

> [!WARNING]
> This repo is pretty much unmaintained so use the code at your own risk :)
> If you have issues I can do my best to help but I don't have a ton of motivation to work on this anymore.
> Astro Studio and Cloudflare email through mailchannels has also been depreciated
> both of which this project depends semi heavily on so you will likely need to implement new services.

MagicSnap was a project I started thinking about around December of 2023 when I joined a frc robotics team for the first time. My team was using teamsnap at the time but no one liked it, it was exceptionaly clunky, slow, and riddled with ads for the free tier. My goal became to make a better solution both to give my team a better solution and to have an interesting project to work on.  

I've been working on this project for over 2 months of active development now and I'm quite proud of it. (several months later i'm still proud of it but more as something that helped me learn a bunch about making a more complex program) The main site is hosted on netlify with serverless functions providing access to astro db where all the data is stored for the team. Emails are provided by a cloudflare worker based off of [Sh4yy/cloudflare-email](https://github.com/Sh4yy/cloudflare-email) which can be found here [kcoderhtml/cloudflare-email](https://github.com/kcoderhtml/cloudflare-email). The site is written in astro and is fully typescript native.

## Screenshots

I included screenshots of all the dashboard pages below

<img src=".github/images/dashboard.png" alt="the main dashboard">

<details>
    <summary>Click to open the rest</summary>
    <img src=".github/images/users.png" alt="users page">
    <img src=".github/images/messages.png" alt="messages page">
    <img src=".github/images/settings.png" alt="settings page">
</details>

## License

_© 2024 Kieran Klukas - Licensed under [AGPL 3.0](LICENSE.md)_  
