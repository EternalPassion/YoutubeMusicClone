console.log("Starting JS")
let currentSong = new Audio;
let currentFolder;
let songs;
async function getSongs(folder) {
    currentFolder = folder
    let s = await fetch(`/${folder}/`)
    let sdata = await s.text();
    let div = document.createElement('div')
    div.innerHTML = sdata;
    let finder = div.getElementsByTagName('a')
    songs = []
    for (let i = 0; i < finder.length; i++) {
        const element = finder[i]
        if (element.href.endsWith('.mp3')) //Returning songs that ends with mp3
        {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //Song List
    let songL = document.querySelector('.songList').getElementsByTagName("ul")[0]
    songL.innerHTML = ""
    for (const song of songs) {

        songL.innerHTML += ` <li><img class="invert"  src="img/music.svg" alt="">
                        <div class="songInfo">
                        <div class="songname">${song.replace('%20', ' ')}</div>
                        </div>
                        <img src="img/playsong.svg" alt="" class="PlaySong invert"></li>`
    }

    //Event Listener to each song
    Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', () => {
            PlaySong(e.querySelector('.songInfo').firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}
//Convert Song-duration in minutes: seconds format
let formatTime = t => {
    let minutes = Math.floor(t / 60);
    let seconds = Math.floor(t % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

//Play song
const PlaySong = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = 'img/pause.svg'
    }
    document.querySelector('.song-name').innerHTML = decodeURI(track)
    document.querySelector('.song-duration').innerHTML = "0:00 / 3:21"
}

//Songs
async function cardSong() {
    let s = await fetch(`/songs/all`)
    let sdata = await s.text();
    let div = document.createElement('div')
    div.innerHTML = sdata;
    let finder = div.getElementsByTagName('a')
    let array = Array.from(finder)
    let cardsCointainer = document.querySelector('.cards-container')
    for (let index = 0; index < array.length; index++) {
        const e = array[index]
        if (e.href.includes('/songs')) {
            let folder = e.href.split('/').slice(-2)[1]
            if (folder !== 'songs' && folder !== 'all') {
                let s = await fetch(`songs/all/${folder}/info.json`)
                let sdata = await s.json();
                cardsCointainer.innerHTML += `<div class="card" data-folder="${folder}">
                        <img src="img/play.svg" alt="play" class="play">
                        <img src="songs/all/${folder}/cover.jpg" alt="thumbnail" class="thumbnail">
                        <h3>${sdata.title}</h3>
                        <p>Song . ${sdata.singer}</p>
                    </div>`
            }
        }

    }
    //Card support
    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async item => {
            await getSongs(`songs/all/${item.currentTarget.dataset.folder}`)
            PlaySong(songs[0])
        })
    })

}

//Display album for playlist
async function displayAlbum() {
    let s = await fetch('/songs/')
    let sdata = await s.text();
    let div = document.createElement('div')
    div.innerHTML = sdata;
    let playlistCointainer = document.querySelector('.playlist-container')
    let finder = div.getElementsByTagName('a')
    let array = Array.from(finder)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]
        if (e.href.includes('/songs')) {
            let folder = e.href.split('/').slice(-2)[1]
            if (folder !== 'songs' && folder !== 'all') {
                let s = await fetch(`songs/${folder}/info.json`)
                let sdata = await s.json();
                playlistCointainer.innerHTML += `<div class="card2" data-folder="${folder}">
                            <img src="img/play.svg" alt="play" class="play">
                            <img src="/songs/${folder}/cover.jpg" alt="thumbnail" class="thumbnail">
                            <h3>${sdata.title}</h3>
                        </div>`
            }
        }
    }
    //Playlist support
    Array.from(document.getElementsByClassName('card2')).forEach(e => {
        e.addEventListener('click', async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            PlaySong(songs[0])
        })
    })
}


async function main() {
    await getSongs('songs/eng')
    PlaySong(songs[0], true)
    displayAlbum()
    cardSong()

    // Adding event listener in playbar elements
    let play = document.getElementById('play')
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/playsong.svg"
        }
    })
    //Adding song-duration
    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.song-duration').innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })
    //Seekbar property
    let seekbar = document.querySelector('.seekbar')
    seekbar.addEventListener('click', e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100  // getBoundingClientRect() function to get the object postion and size.
        document.querySelector('.circle').style.left = percent + '%'
        currentSong.currentTime = (currentSong.duration) * percent / 100
    })
 
    //close event listener
    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = -100 + '%'
    })
    //cross working in nav bar
    let SongSearch = document.querySelector('.song-search')
    document.querySelector('.cross').addEventListener('click', () => {
        SongSearch.value = ""
    })
    //search option in nav bar for now
    document.querySelector('.ssvg').addEventListener('click', () => {
        if (SongSearch.value == "") {
            alert("Please type the name of the song")
            return;
        }
        else {
            alert("This function will be added later")
        }
    })

    //Event Listener to previous song
    document.querySelector('.previous-song').addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index - 1 >= 0)) {
            PlaySong(songs[index - 1])
        }
    })

    //Event Listener to next song
    document.querySelector('.next-song').addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if ((index + 1) < songs.length) {
            PlaySong(songs[index + 1])
        }
    })

    //Event Listener to volume slider using input
    let volumeSlider = document.querySelector('.volume-slider')
    volumeSlider.addEventListener("input", function () {
        currentSong.volume = Number(this.value) / 100
        if (currentSong.volume == 0) {
            volume.src = 'img/mute.svg'
        }
        else {
            volume.src = 'img/volume.svg'
        }
    })

    //Adding mute event listener
    let volume = document.querySelector('.volume')
    volume.addEventListener('click', () => {
        if (currentSong.volume != 0) {
            volume.src = 'img/mute.svg'
            currentSong.volume = 0
            volumeSlider.value = 0
        }
        else {
            volume.src = 'img/volume.svg'
            currentSong.volume = .5
            volumeSlider.value = 50
        }
    })

    // Adding hamburger function
    const sidebar = document.querySelector('.left');
    const rightPanel = document.querySelector('.right');
    const body = document.body;
    const hamburger = document.querySelector('.hamburger');
    const closeBtn = document.querySelector('.close');

    hamburger.addEventListener('click', () => {
        sidebar.style.left = '0';
        rightPanel.classList.add('noscroll');
        body.classList.add('noscroll');
    });

    closeBtn.addEventListener('click', () => {
        sidebar.style.left = '-100%';
        rightPanel.classList.remove('noscroll');
        body.classList.remove('noscroll');
    });

}
main()

console.log("Thanks for visiting. By Aman Kumar Shaw")


