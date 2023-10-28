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
    $(document).ready(function(){
        const $body = $(document.body);
        const $postsContainer = $body.find("#weibo-extend-posts")
        _.each(list, item=>{
            let $post = $('<div>').addClass(postClass);
            var $text = $('<p>').text(item.text);
            $post.append($text);
            var $image = $('<img>').attr('src', item.image);
            $post.append($image);
            $postsContainer.append($post);
        })
    })
}

start()