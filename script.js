let currSong = new Audio
let songs;
let currFolder;

function secondsToTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let temp = element.href.split(`/${currFolder}/`)[1]
            songs.push(temp.split(".mp3")[0])
        }
    }


    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML +
            `<li>
            <div class="info">
                <img class="invert" src="Assets/music.svg" alt="">
                <div class="info1">
                    <div>${song.split("-")[1].replaceAll("%20", " ")}</div>
                    <div>${song.split("-")[0].replaceAll("%20", " ")}</div>
                </div>
            </div>
            <div class="playNow">
                <span>Play Now</span>
                <img src="Assets/play.svg" alt="">
            </div>
        </li>`
    }


    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        let temp = e.querySelector(".playNow")
        temp.addEventListener("click", element => {
            let track = `/${currFolder}/` + e.querySelector(".info1").children[1].innerHTML + "-" + e.querySelector(".info1").firstElementChild.innerHTML.trim() + ".mp3"
            playMusic(track)
        })
    })
    return songs
}



const playMusic = (track, pause = false) => {
    currSong.src = track
    if (!pause) {
        currSong.play()
        play.src = "Assets/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = ((track.split("-")[1]).split(".mp3")[0] + " - " + (track.split("-")[0]).split(`/${currFolder}/`)[1]).replaceAll("%20", " ")
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}


async function displayAlbums() {
    let a = await fetch(`/Songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`/Songs/${folder}/info.json`)
            let response = await a.json()

            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div data-folder="${folder}" class="card">
              <img
                src="/Songs/${folder}/cover.jpg"
                alt=""
              />
              <h3>${response.title}</h3>
              <p>${response.description}</p>
              <div class="play">

                  <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="11" fill="#1fdf64" />
                      <path d="M7 6L17 12L7 18V6Z" fill="#000000" transform="translate(2, 0)" />
                    </svg>
                </div>
              
            </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`)
            playMusic(`/${currFolder}/` + songs[0] + ".mp3")
        })
    })
}

async function main() {
    await getSongs("Songs/Rap")
    playMusic(`/${currFolder}/` + songs[0] + ".mp3", true)


    displayAlbums()

    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play()
            play.src = "Assets/pause.svg"
        } else {
            currSong.pause()
            play.src = "Assets/play.svg"
        }
    })

    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToTime(currSong.currentTime)}/${secondsToTime(currSong.duration)}`
        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currSong.currentTime = (currSong.duration * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })


    previous.addEventListener("click", () => {
        let currIndex = songs.indexOf((currSong.src.split(`/${currFolder}/`)[1]).split(".mp3")[0])
        if (currIndex == 0) {
            playMusic(`/${currFolder}/` + songs[songs.length - 1] + ".mp3")
        } else {
            playMusic(`/${currFolder}/` + songs[currIndex - 1] + ".mp3")
        }
    })
    next.addEventListener("click", () => {
        let currIndex = songs.indexOf((currSong.src.split(`/${currFolder}/`)[1]).split(".mp3")[0])
        if ((currIndex + 1) == songs.length) {
            playMusic(`/${currFolder}/` + songs[0] + ".mp3")
        } else {
            playMusic(`/${currFolder}/` + songs[currIndex + 1] + ".mp3")
        }
    })


    volumeBar.addEventListener("change", (e) => {
        currSong.volume = parseInt(e.target.value) / 100
    })


    volume.addEventListener("click",e=>{
        if(e.target.src.includes("Assets/volume.svg")){
            e.target.src = e.target.src.replace("Assets/volume.svg","Assets/mute.svg")
            volumeBar.value = 0
            currSong.volume = 0
        }else{
            e.target.src = e.target.src.replace("Assets/mute.svg","Assets/volume.svg")
            volumeBar.value = 20
            currSong.volume = 0.2 
        }
    })


}


main()