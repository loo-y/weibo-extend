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
    const visibleItems = Math.floor( 500 /itemHeight) // 可见列表项数量
    const bufferItems = 2 // 上下预加载的列表项数量

    console.log(`dataSource`, dataSource)
    function updateContent(startIndex) {
        console.log(`startIndex`, startIndex)
        const bufferIndex = Math.min(startIndex + visibleItems + bufferItems * 2, totalItems)
        content.style.minHeight = `${bufferIndex * itemHeight}px`;

        const $startListImtem = $('.list-item[notview="true"]:first');
        console.log(`startIndex`, startIndex, dataSource[startIndex].text_raw)
        $startListImtem.text(`${startIndex}, ${dataSource[startIndex].text_raw}`);
        $startListImtem.css("transform", `translateY(${startIndex * itemHeight}px)`)


        const lastIndex =  Math.min(startIndex + visibleItems, totalItems)
        const $nextListImtem = $('.list-item[notview="true"]:last');
        console.log(`lastIndex`, lastIndex, dataSource[lastIndex].text_raw)
        $nextListImtem.text(`${lastIndex}, ${dataSource[lastIndex].text_raw}`);
        $nextListImtem.css("transform", `translateY(${lastIndex * itemHeight}px)`)

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

            if (entry.isIntersecting) {
                // 列表项进入可视范围，显示内容
                $(listItem).attr("notview", false)
            } else {
                // 列表项离开可视范围，隐藏内容
                // listItem.innerHTML = ''
                $(listItem).attr("notview", true)
                $(listItem).css("transform", "translateY(-9999px)")
            }
        })
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

   
        const endIndex = Math.min(0 + visibleItems + bufferItems, totalItems)
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

    // updateContent(0)
})
    // $(document).ready(function() {
    //   const container = document.getElementById('container');
    //   const viewport = document.querySelector('.viewport');
    //   const content = document.querySelector('.content');
    //   const visibleItems = 10; // 可见列表项数量
    //   const itemHeight = 50; // 列表项高度
    //   const bufferItems = 5; // 上下预加载的列表项数量
    //   const dataSource = window.comment01.data.concat(window.comment02.data).concat(window.comment03.data)
    //   const totalItems = dataSource.length; // 总列表项数量
    //   function updateContent(startIndex) {
    //       const listItems = document.getElementsByClassName('list-item');
    //       const endIndex = Math.min(startIndex + visibleItems, totalItems);
    //       for (let i = 0; i < visibleItems; i++) {
    //         const dataIndex = startIndex + i;
    //         const listItem = listItems[i];
    //         if (dataIndex < endIndex) {
    //           const data = dataSource?.[dataIndex];
    //           if(data){
    //               listItem.textContent = data?.text_raw || ``;
    //               listItem.style.transform = `translateY(${i * itemHeight}px)`;
    //           }
    //         } else {
    //           listItem.textContent = '';
    //           listItem.style.transform = `translateY(0)`;
    //         }
    //       }
    //       content.style.transform = `translateY(${startIndex * itemHeight}px)`;
    //     }
    //     function handleIntersection(entries) {
    //       entries.forEach(entry => {
    //         const listItem = entry.target;
    //         const dataIndex = listItem.dataset.index;
    //         const rect = listItem.getBoundingClientRect();
    //         const isVisible = rect.top < container.clientHeight && rect.bottom >= 0;
    //         if (isVisible) {
    //           const translateYValue = Math.max(-rect.top, container.clientHeight - rect.bottom);
    //           listItem.style.transform = `translateY(${translateYValue}px)`;
    //         } else {
    //           const direction = rect.top < 0 ? 'up' : 'down';
    //           const transformValue = direction === 'up' ? 'translateY(-100%)' : 'translateY(100%)';
    //           listItem.style.transform = transformValue;
    //         }
    //       });
    //     }
    //     const observerOptions = {
    //       root: container,
    //       rootMargin: '0px',
    //       threshold: 0
    //     };
    //     const observer = new IntersectionObserver(handleIntersection, observerOptions);
    //     container.addEventListener('scroll', function() {
    //       const startIndex = Math.floor(container.scrollTop / itemHeight);
    //       updateContent(startIndex);
    //       const listItems = document.getElementsByClassName('list-item');
    //       Array.from(listItems).forEach(listItem => {
    //         observer.observe(listItem);
    //       });
    //     });
    //     // 初始化可见列表项和内容
    //     for (let i = 0; i < visibleItems; i++) {
    //       const listItem = document.createElement('div');
    //       listItem.classList.add('list-item');
    //       content.appendChild(listItem);
    //     }
    //     updateContent(0);
    // });
}

singlePostRun()
