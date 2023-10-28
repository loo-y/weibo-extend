import _ from 'lodash'
// @ts-ignore
import $ from 'jquery'
// @ts-ignore
import myblog from './myblog.json'


const start=async ()=>{
    console.log(`start`, start)
    console.log(myblog)
    const list = myblog.list

    const postClass = `weibopost flex flex-col`
    let isLoaded = false;
    $(document).ready(function(){
        if(isLoaded) return;
        isLoaded = true;
        const $body = $(document.body);
        const $postsContainer = $body.find("#weibo-extend-posts")
        _.each(list, item=>{
            const { text, text_raw, picShows} = item || {}
            let $post = $('<div>').addClass(postClass);
            let $text = $('<p>').text(text_raw || text);
            $post.append($text);
            if(!_.isEmpty(picShows)){
                _.map(picShows, picItem=>{
                    let $image = $('<img>').attr('src', `./image/${picItem.picName}`);
                    $post.append($image);
                })
            }

            $postsContainer.append($post);
        })
    })
}

start()