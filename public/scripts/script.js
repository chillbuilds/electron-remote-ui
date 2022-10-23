const path = require('path')
const vlc = require('vlc-player')
const dirPathObj = [{ type: 'movies', path: 'D:\\video\\movies\\' }, { type: 'tv', path: 'D:\\video\\tv\\' }, { type: 'nes', path: 'D:\\games\\emulators\\' }]

$.urlParam = function(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href)
    return results[1] || 0
}

console.log(window.location.href)

let selection = 0
let btnDelay = false

let activeSelect = () => {
    $('.active').removeClass('active')
    $($('.mainIcon')[selection]).addClass('active')
}

let left = () => {
    console.log('left')
    if(selection > 0){
        selection--
    }
    activeSelect()
}

let right = () => {
    console.log('right')
    if(selection < 2){
        selection++
    }
    activeSelect()
}

let select = () => {
    console.log('selected')
    let selectedID = $('.active').attr('id')
    window.location.href = `./${selectedID}.html`
}

$(document).on('keypress',function(e) {

    if(btnDelay == false){
        btnDelay = true
        setTimeout(()=>{
            switch(e.which) {
                case 52:
                    left()
                    break;
                case 54:
                    right()
                    break;
                case 53:
                    select()
                    break;
                default:
                    break;
            }
            btnDelay = false
        }, 200)
    }

    console.log(e.which)
})

// check which page returned from to preselect
if($.urlParam('prev')){
    $('.active').removeClass('active')
    $(`#${$.urlParam('prev')}`).addClass('active')
    selection = $(`#${$.urlParam('prev')}`).attr('index')
    console.log($.urlParam('prev'))
}