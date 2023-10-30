import _ from 'lodash'
// @ts-ignore
import $ from 'jquery'
// @ts-ignore
import myblog from './myblog.json'
import dayjs from 'dayjs'


const postClass = `weibopost bg-white flex-col pt-5 pb-8 px-8 rounded-md flex-col`
const postInsideClass = ` flex flex-col gap-3 w-full max-h-[50rem] overflow-y-scroll`
const textClass = ``
const imageContainerClass = `flex justify-start items-center flex-wrap`
const imageBoxClass = `flex w-1/3 h-52 p-1`
const imageClass = `cursor-pointer w-full h-full object-cover rounded-xl`
const retweetPostClass = `flex reweetpost bg-gray-100 pt-5 pb-8 px-8 flex my-2 rounded-md flex-col`
const videoContainerClass = `video flex flex-col items-center flex-wrap gap-2 mb-2`
const videoClass = `cursor-pointer object-cover rounded-xl max-h-[38rem]  w-fit`
const titleClass = `flex flex-col text-gray-500 text-sm italic`

const start=async ()=>{
    console.log(`start`, start)
    console.log(myblog)
    const list = myblog.list

    let isLoaded = false;
    $(document).ready(function(){
        if(isLoaded) return;
        isLoaded = true;
        const $body = $(document.body);
        const $postsContainer = $body.find("#weibo-extend-posts")
        _.each(list, item=>{
            const { text, text_raw, picShows, region_name, source, created_at, retweetedBlog} = item || {}
            const $post = appendBlog({$container: $postsContainer, blogItem: item, postClass: postClass})
            if(!_.isEmpty(retweetedBlog)){
                appendBlog({$container: $post, blogItem:retweetedBlog, postClass: retweetPostClass})
            }
        })
    })
}

start()

const appendBlog = ({$container, blogItem, postClass}: Record<string, any>)=>{
    const { text, text_raw, picShows, region_name, source, created_at, user, mediaInfoList, title } = blogItem || {}

    let $postInside = $('<div>').addClass(postInsideClass);

    const titleText = title?.text || '';
    if(titleText){
        const $titleDiv = $("<div>").text(titleText).addClass(titleClass);
        $postInside.append($titleDiv)
    }

    const {idstr: user_idstr, screen_name: user_screen_name, profile_url: user_profile_url } = user || {}
    if(user_idstr && user_screen_name){
        const userInfoText =  `@${user_screen_name}`
        let $userInfoDiv = $("<div>").addClass(`flex text-base font-bold text-gray-700 hover:text-orange-500 cursor-pointer`).append($("<span>").html(userInfoText))
        $userInfoDiv.click(function(){
            const jumpUrl = user_profile_url ? `https://weibo.com${user_profile_url}` : (user_idstr ? `https://weibo.com/u/${user_idstr}` : '')
            if(jumpUrl){
                window.open(`https://weibo.com/u/${user_idstr}`, "_blank");
            }
        })
        $postInside.append($userInfoDiv)
    }
    // 型号 + 时间
    const createdDate = dayjs(created_at).format("YYYY-MM-DD HH:mm:ss")
    const smallInfo = `${createdDate} ${source ? '来自 ' + source : ''}`
    let $smallInfoDiv = $("<div>").addClass(`flex text-xs text-gray-400 `).append($("<span>").html(smallInfo))
    $postInside.append($smallInfoDiv)

    // 文字
    let $text = $('<p>').text(text_raw || text);
    $text.addClass(textClass)
    $postInside.append($text);

    // 图片
    if(!_.isEmpty(picShows)){
        let $imageContainer = $('<div>').addClass(imageContainerClass);
        _.map(picShows, picItem=>{
            const srcUrl = `./image/${picItem.picName}`
            let $image = $('<img>').attr('src', srcUrl);
            $image.addClass(imageClass);
            $image.click(function() {
                $('#imagePopup img').attr('src', srcUrl);
                $('#imagePopup').removeClass('hidden').addClass("flex");
                });
            
                $('#imagePopup').click(function() {
                // @ts-ignore
                $(this).addClass('hidden').removeClass('flex');
                });

            let $imageBox = $('<div>').addClass(imageBoxClass)
            $imageBox.append($image)
            $imageContainer.append($imageBox);
        })

        $postInside.append($imageContainer)
    }

    // 视频
    if(!_.isEmpty(mediaInfoList)){
        let $videoContainer = $('<div>').addClass(videoContainerClass);
        _.map(mediaInfoList, mediaItem=>{
            const { format, media_id} = mediaItem
            const srcUrl = `./video/${media_id}.${format}`
            let $video = $('<video>').attr('src', srcUrl);
            $video.attr("controls", true)
            $video.addClass(videoClass);
            $videoContainer.append($video)
        })
        $postInside.append($videoContainer)
    }
    const $post = $('<div>').addClass(postClass)
    $post.append($postInside)
    $container.append($post);
    return $post;
}