import _ from 'lodash'
// @ts-ignore
import $ from 'jquery'

import dayjs from 'dayjs'

const singlePostRun = () => {
    $(document).ready(function () {
    const container = document.getElementById('container')
    const viewport = document.querySelector('.viewport')
    const content = document.querySelector('.content')
    const dataSource = window.comment01.data.concat(window.comment02.data).concat(window.comment03.data)
    const totalItems = dataSource.length // 总列表项数量
    const itemHeight = 100 // 列表项高度
    // const visibleItems = Math.floor( 500 / itemHeight) // 可见列表项数量
    const bufferItems = 5 // 上下预加载的列表项数量
    let visibleItems = $('.list-item[visiable="true"]')?.length
    console.log(`dataSource`, dataSource)
    let firstIndex = -1, lastIndex = 0;
    function updateContent(startIndex) {
        if(!(visibleItems > 0)){
            visibleItems = $('.list-item[visiable="true"]')?.length
        }
        
        const bufferIndex = Math.min(startIndex + visibleItems + bufferItems * 2, totalItems)
        const newMinHeight = parseInt(content.style.minHeight) > bufferIndex * itemHeight ? parseInt(content.style.minHeight) : bufferIndex * itemHeight
        content.style.minHeight = `${newMinHeight}px`;


        firstIndex = startIndex > 0 ? startIndex - 1 : -1
        lastIndex =  Math.min(startIndex + visibleItems, totalItems)

        console.log(`startIndex: ${startIndex}, firstIndex: ${firstIndex}, lastIndex: ${lastIndex}`)

        // const $firstListImtem = $('.list-item[notview="true"]:first');
        // const firstIndex = startIndex > 0 ? startIndex - 1 : 0
        // console.log(`firstIndex`, firstIndex, dataSource[firstIndex].text_raw)
        // $firstListImtem.text(`${firstIndex}, ${dataSource[firstIndex].text_raw}`);
        // $firstListImtem.css({
        //     transform: `translateY(${firstIndex * itemHeight}px)`
        // })
        // // $firstListImtem.attr("notview", false)


        // const lastIndex =  Math.min(startIndex + visibleItems, totalItems)
        // const $nextListImtem = $('.list-item[notview="true"]:last');
        // console.log(`lastIndex`, lastIndex, dataSource[lastIndex].text_raw)
        // $nextListImtem.text(`${lastIndex}, ${dataSource[lastIndex].text_raw}`);
        // $nextListImtem.css({transform: `translateY(${lastIndex * itemHeight}px)`})
        // $nextListImtem.attr("notview", false)

        // let html = ''

        // for (let i = startIndex; i < endIndex; i++) {
        //     const data = dataSource[i]
        //     html += `<div class="list-item" data-index="${i}">${data.text_raw}</div>`
        // }

        // console.log(`updateContent`, html)
        // content.innerHTML = html
        // content.style.top = `${(startIndex - bufferItems) * itemHeight}px`
    }

    function handleIntersection(entries) {
        entries.forEach(entry => {
            const listItem = entry.target
            const dataIndex = listItem.dataset.index
            console.log(`handleIntersection`)
            if (entry.isIntersecting) {
                // 列表项进入可视范围，显示内容
                $(listItem).attr("visiable", true)
            } else {
                // 列表项离开可视范围，隐藏内容
                // listItem.innerHTML = ''
                $(listItem).attr("visiable", false)
                $(listItem).css("transform", "translateY(-9999px)")
            }
        })

        if(firstIndex >= 0){
            let $firstListImtem = $(`.list-item[data-index="${firstIndex}"]`)
            if($firstListImtem){
                console.log(`firstListImtem`, $firstListImtem)
            }else{
                $firstListImtem = $('.list-item[visiable="false"]:first');
                console.log(`firstIndex`, firstIndex, dataSource[firstIndex].text_raw, $firstListImtem)
                $firstListImtem.text(`${firstIndex}, ${dataSource[firstIndex].text_raw}`);
                $firstListImtem.attr("data-index", firstIndex)
            }
            
            $firstListImtem.css({
                transform: `translateY(${firstIndex * itemHeight}px)`
            })
            
        }


        if(lastIndex == 0){
            lastIndex = $('.list-item[visiable="true"]')?.length
            
        }
        if(lastIndex < totalItems){
            let $nextListImtem = $(`.list-item[data-index="${lastIndex}"]`)
            if($nextListImtem?.length){
                console.log(`nextListImtem`, $nextListImtem)
            }else{
                $nextListImtem = $('.list-item[visiable="false"]:last');
                console.log(`lastIndex`, lastIndex, dataSource[lastIndex].text_raw)
                $nextListImtem.text(`${lastIndex}, ${dataSource[lastIndex].text_raw}`);
                $nextListImtem.attr("data-index", lastIndex)
            }
            
            $nextListImtem.css({transform: `translateY(${lastIndex * itemHeight}px)`})
            
        } 

        const allVisiableItems = $('.list-item');
        let missItemIndex = generateArray(firstIndex, lastIndex)
         _.each(allVisiableItems, item=>{
            const dataIndex = Number($(item).attr('data-index'));
            const isIncluded = missItemIndex.indexOf(dataIndex)
            if(isIncluded > -1){
                missItemIndex.splice(isIncluded, 1)
            }
        })
        console.log(`missItemIndex`, missItemIndex)
        if(!_.isEmpty(missItemIndex)){
            _.each(missItemIndex, miss=>{
                
                const $newListImtem = $('.list-item[visiable="false"]:last');
                $newListImtem.text(`${miss}, ${dataSource[miss].text_raw}`);
                $newListImtem.css({transform: `translateY(${miss * itemHeight}px)`})
                $newListImtem.attr("data-index", miss)
                console.log(`miss`, miss)
            })
        }
    }

    const observerOptions = {
        root: container,
        rootMargin: '0px',
        threshold: 0,
    }

    const observer = new IntersectionObserver(handleIntersection, observerOptions)

    container.addEventListener('scroll', function () {
        const startIndex = Math.floor(container.scrollTop / itemHeight)
        console.log(`container.scrollTop`, container.scrollTop)
        updateContent(startIndex)


    })

        const initVisibleItems = Math.floor( 500 / itemHeight) // 可见列表项数量
        const endIndex = Math.min(0 + initVisibleItems + bufferItems, totalItems)
        let html = ''

        for (let i = 0; i < endIndex; i++) {
            const data = dataSource[i]
            html += `<div class="list-item" data-index="${i}" style="transform:translateY(${itemHeight*i}px)">${data.text_raw}</div>`
        }

        // console.log(`updateContent`, html)
        content.innerHTML = html
        // content.style.top = `${(0 - bufferItems) * itemHeight}px`

        const listItems = document.getElementsByClassName('list-item')
        Array.from(listItems).forEach(listItem => {
            observer.observe(listItem)
            
        })

        visibleItems = $('.list-item[visiable="true"]')?.length
        console.log(`visibleItems`, visibleItems)
    // updateContent(0)
})
    
}

singlePostRun()


function generateArray(start, end) {
    var arr = [];
    if(start < 0) start = 0;
    for (var i = start; i < end; i++) {
      arr.push(i);
    }
    
    return arr;
  }