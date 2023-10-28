import _ from 'lodash'
// @ts-ignore
import $ from 'jquery'
// @ts-ignore
import myblog from './myblog.json'
import dayjs from 'dayjs'


const start=async ()=>{
    console.log(`start`, start)
    console.log(myblog)
    const list = myblog.list

    const postClass = `weibopost bg-white flex pt-5 pb-8 px-8 rounded-md`
    const postInsideClass = ` flex flex-col gap-3 w-full max-h-[50rem] overflow-y-scroll`
    const textClass = ``
    const imageContainerClass = `flex justify-start items-center flex-wrap`
    const imageBoxClass = `flex w-1/3 h-52 p-1`
    const imageClass = `cursor-pointer w-full h-full object-cover rounded-xl`
    let isLoaded = false;
    $(document).ready(function(){
        if(isLoaded) return;
        isLoaded = true;
        const $body = $(document.body);
        const $postsContainer = $body.find("#weibo-extend-posts")
        _.each(list, item=>{
            const { text, text_raw, picShows, region_name, source, created_at} = item || {}
            let $postInside = $('<div>').addClass(postInsideClass);
            
            // 型号 + 时间
            const createdDate = dayjs(created_at).format("YYYY-MM-DD HH:mm:ss")
            const smallInfo = `${createdDate} ${source ? '来自 ' + source : ''}`
            let $smallInfoDiv = $("<div>").addClass(`flex  text-xs text-gray-400 `).append($("<span>").html(smallInfo))
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
            const $post = $('<div>').addClass(postClass)
            $post.append($postInside)
            $postsContainer.append($post);
        })
    })
}

start()