const fs = require('fs')
const { parse } = require('path')
const path = require('path')
const vlc = require('vlc-player')
let dirArr = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/json/directories.json'), 'utf-8'))
let dirPath = ''

for(var i of dirArr) {
    if(i.type == 'tv'){
        dirPath = i.path
    }
}

let btnDelay = false
let selected = false
let modalOpen = false
let selection = 0
let modalSelection = 0
let fileArr = []
let subBtn = 'play'

fs.readdirSync(dirPath).forEach(file =>{

    if(file.split('.').pop() != 'srt'){
        fileArr.push(file)
    }
})

fileArr.forEach((file, i) => {
    $('.tv').append(`

        <div class="tile" index="${i}">
            <div class="title">
                ${file.split('.')[0].split('-').join(' ')}
            </div>
            <div class="tileImg">
                <img width="100%" src="../assets/images/jp.jpg">
            </div>
            <div class="icon play" path="${file.split(' ').join('-')}">
                <img width="100%" src="../assets/images/icons/play.png">
            </div>
            <div class="icon add" path="${file.split(' ').join('-')}">
                <img width="100%" src="../assets/images/icons/plus.png">
            </div>
        </div>

`)
})

$('.tile').addClass('tileBorder')
$($('.tile')[0]).addClass('active')
$('.active').removeClass('tileBorder')

$('.tv').append(`
    <script>
        $('.play').on('click', function() {
            console.log($(this).attr('id'))
        })
        $('.add').on('click', function() {
            console.log($(this).attr('id'))
        })
    </script>
`)

let deletePlaylist = () => {
    if(modalOpen == false){
        modalOpen = true
        $('.modal').attr('style', 'display: inline-block')
        $('.modal-content').html('delete playlist?')
    }else{
        modalOpen = false
        $('.modal').attr('style', 'display: none')
    }
}

let togglePlaylist = () => {
    if(modalOpen == false){
        modalOpen = true
        resetPlaylist()
        $($('.playlistItem')[modalSelection]).addClass('activePlaylist')
    }else{
        modalOpen = false
        $('.modal').attr('style', 'display: none')
    }
}

let resetPlaylist = () => {
    $('.modal-content').html(`
        <div class="playlistItem play" path="play">
            Play All
        </div>
        <div class="playlistItem delete" path="delete">
            Delete All
        </div>
    `)
    $('.modal').attr('style', 'display: inline-block')
    fs.readFileSync('./playlist.m3u', 'utf-8').split('\n').forEach((file, i) => {
        if(file != ''){
            let parsedFile = file.split('\\').pop()
            $('.modal-content').append(`
                <div class="playlistItem" index="${i}" path="${file}">
                    ${parsedFile.split('.')[0].split('-').join(' ')}
                    <div class="deleteIcon">
                        <img width="100%" src="../assets/images/icons/delete.png">
                    </div>
                <div>
            `)
        }
    })
}

let addToPlaylist = (file) => {
    fs.appendFileSync('./playlist.m3u', file + '\n')
}

let activeSelect = () => {
    $('.active').removeClass('active')
    $('.tile').addClass('tileBorder')
    $($('.tile')[selection]).addClass('active')
    $('.active').removeClass('tileBorder')
}

let activePlaylistSelect = () => {
    $('.activePlaylist').removeClass('activePlaylist')
    $($('.playlistItem')[modalSelection]).addClass('activePlaylist')
}

let select = () => {
    if(selected == false && modalOpen == false){
        selected = true
        $(`.active .${subBtn}`).addClass('subBtnSelect')
    }else if(selected == true && modalOpen == false){
        let parsedPath = (dirPath + $(`.active .${subBtn}`).attr('path')).split('/').join('\\')
        if(subBtn == 'play'){
            const player = vlc(['--fullscreen', parsedPath, 'vlc://quit'])
            selected = false
            $(`.active .${subBtn}`).removeClass('subBtnSelect')
        }
        if(subBtn == 'add'){
            addToPlaylist(`file:///${dirPath + $('.active .play').attr('path')}`)
            selected = false
            $(`.active .${subBtn}`).removeClass('subBtnSelect')
        }
    }// playlist select
    if(modalOpen == true){
        // play all
        if($('.activePlaylist').attr('path') == 'play'){
            // const player = vlc(['--fullscreen', 'C:\\Users\\heliu\\dev\\node\\remote-ui\\playlist.m3u', 'vlc://quit'])
            if(fs.readFileSync('./playlist.m3u', 'utf-8') != ''){
                const player = vlc(['--fullscreen', '.\\playlist.m3u', 'vlc://quit'])
            }
        }else
        // delete all from playlist
        if($('.activePlaylist').attr('path') == 'delete'){
            fs.writeFileSync('./playlist.m3u', '')
            togglePlaylist()
        }else{
            // delete single item from playlist
            console.log('v v path v v')
            console.log($('.activePlaylist').attr('path'))
            let playlistArr = fs.readFileSync('./playlist.m3u', 'utf-8').split('\n')
            for(var i = 0; i < playlistArr.length; i++) {
                if(playlistArr[i] == $('.activePlaylist').attr('path')){
                    playlistArr.splice(i, 1)
                }
            }
            fs.writeFileSync('./playlist.m3u', playlistArr.join('\n'))
                resetPlaylist()
                modalSelection--
                $($('.playlistItem')[modalSelection]).addClass('activePlaylist')
            // deleteFromPlaylist($('.activePlaylist').attr('path'))
        }
    }
}

let up = () => {
    if(selected == false && modalOpen == false){
        console.log(`selection: ${selection}`)
        if(selection > 3){
            selection =  selection - 4
        }
        activeSelect()
        console.log('up')
    }
    if(modalOpen == true && modalSelection > 0){
        modalSelection--
        activePlaylistSelect()

    }
}

let down = () => {
    if(selected == false && modalOpen == false){
        console.log(`selection: ${selection}`)
        console.log($('.tile').length-4)
        if(selection < $('.tile').length-4){
            selection = selection + 4
        }
        activeSelect()
        console.log('down')
    }
    if(modalOpen == true && modalSelection < $('.playlistItem').length - 1){
        modalSelection++
        activePlaylistSelect()
    }
}

let left = () => {
    if(selected == false){
        console.log('left')
        if(selection > 0){
            selection--
        }
        activeSelect()
    }else{
        if(subBtn == 'add'){
            $(`.active .${subBtn}`).removeClass('subBtnSelect')
            subBtn = 'play'
            $(`.active .${subBtn}`).addClass('subBtnSelect')
        }
    }
}

let right = () => {
    if(selected == false){
        console.log('right')
        if(selection < fileArr.length-1){
            selection++
        }
        activeSelect()
    }else{
        if(subBtn == 'play'){
            $(`.active .${subBtn}`).removeClass('subBtnSelect')
            subBtn = 'add'
            $(`.active .${subBtn}`).addClass('subBtnSelect')
        }
    }
}

let home = () => {
    if(selected == false && modalOpen == false){
        window.location.href = `./index.html?prev=${page}`
    }else if(selected == true && modalOpen == false){
        selected = false
        $(`.active .${subBtn}`).removeClass('subBtnSelect')
    }
    if(modalOpen == true){
        modalOpen = false
        $('.modal').attr('style', 'display: none')
    }

}

$(document).on('keypress',function(e) {

    if(btnDelay == false){
        btnDelay = true
        setTimeout(()=>{
            switch(e.which) {
                case 56:
                    up()
                    break;
                case 50:
                    down()
                    break;
                case 52:
                    left()
                    break;
                case 54:
                    right()
                    break;
                case 53:
                    select()
                    break;
                case 55:
                    home()
                    break;
                case 47:
                    togglePlaylist()
                    break;
                case 46:
                    deletePlaylist()
                    break;
                default:
                    break;
            }
            btnDelay = false
        }, 200)
    }
    console.log(e.which)
})