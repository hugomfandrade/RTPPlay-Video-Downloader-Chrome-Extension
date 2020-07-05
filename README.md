# RTPPlay Video Downloader App
An Android app which allows users to download videos and podcasts from RTPPlay, TVIPlayer and SIC, manage them locally, and keep a local history of the user's activity.

Apart from the functionality of the app, this project enables me to experience the Kotlin programming language, and is used to put the latest architecural principles, guidelines and tools from Android into practice.

Initially, the base project followed an MVP architecture with a local SQLite database implementation, while using the original Android Support Library. Currently:
- an MVVM pattern replaced the more verbose MV
- the introduction of the Room library provided an abstracion layer that enabled to remove most of the SQLite implementation code.
- AndroidX replaced the no longer supported Support Library

## Demo
Once you select an URL from your browser or the native apps of the platforms, the link can be shared to the this app and, if compatible, the app will parse the media file and download it.

A demo video displaying the functionality of the app can be found here [https://www.youtube.com/watch?v=mJwxJ1Oad3Y]. 

![](art/demo-gif.gif)

### Screenshot
|  ![](art/screenshot-01.png)  |  ![](art/screenshot-03.png)  |  ![](art/screenshot-04.png)  |
|:----------------------------:|:----------------------------:|:----------------------------:|
|  ![](art/screenshot-05.png)  |  ![](art/screenshot-06.png)  |  ![](art/screenshot-07.png)  | 