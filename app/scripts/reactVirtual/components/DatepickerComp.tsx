'use client'
import { useRef, useState } from 'react'
import Datepicker from 'tailwind-datepicker-react'
import { IOptions } from 'tailwind-datepicker-react/types/Options'
import SvgCalendarIcon from './SvgCalendarIcon'
import dayjs from 'dayjs'

interface IDatepickerCompProps {
    classNames?: string
    title?: string
    callback?: (info: any) => void
}
const DatepickerComp = ({ title, callback, classNames }: IDatepickerCompProps) => {
    const [showDatepicker, setShowDatepicker] = useState(false)
    const [selectedDate, setSelectedDate] = useState<string>('')
    const datepickerRef = useRef(null)
    const handleClickInput = () => {
        setShowDatepicker(true)
    }
    const handleChange = (selectedDate: Date) => {
        console.log(selectedDate)
        if (selectedDate) {
            const dateString = dayjs(selectedDate).format('YYYY-MM-DD')
            setSelectedDate(dateString)
            callback && callback(selectedDate)
        }
    }

    const handleContainerBlur = () => {
        // setTimeout(()=>{
        //     setShowDatepicker(false)
        // }, 300)
    }
    const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault() // 阻止默认行为
        event.stopPropagation() // 阻止事件冒泡
    }
    const options = {
        ...defaultOptions,
        title: title || defaultOptions.title,
    }
    return (
        <div onBlur={handleContainerBlur} ref={datepickerRef} onClick={handleContainerClick} className="relative">
            <Datepicker
                options={options}
                onChange={handleChange}
                show={showDatepicker}
                setShow={() => {
                    console.log(`setShow`)
                    setShowDatepicker(false)
                }}
                classNames={classNames || 'w-36'}
            >
                <div className="w-full text-xs">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SvgCalendarIcon />
                        </div>
                        <input
                            id="date"
                            className="pl-9  pr-2.5 py-2 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="请选择日期"
                            readOnly
                            type="text"
                            onClick={handleClickInput}
                            value={selectedDate}
                            name="date"
                        ></input>
                    </div>
                </div>
            </Datepicker>
        </div>
    )
}

export default DatepickerComp

const defaultOptions: IOptions = {
    title: '日期选择',
    autoHide: true,
    todayBtn: false,
    clearBtn: true,
    clearBtnText: '清除',
    maxDate: new Date(),
    minDate: new Date('2000-01-01'),
    theme: {
        background: 'bg-gray-200 bg-opacity-95',
        todayBtn: '',
        clearBtn: '',
        icons: '',
        text: 'px-2 h-9 overflow-y-hidden hover:bg-gray-500 hover:text-gray-50 cursor-pointer',
        disabledText: 'px-2 h-8 overflow-y-hidden text-gray-300',
        input: '',
        inputIcon: '',
        selected: 'bg-orange-500',
    },
    datepickerClassNames: 'top-7',
    defaultDate: new Date(),
    language: 'cn',
    disabledDates: [],
    weekDays: ['一', '二', '三', '四', '五', '六', '日'],
    inputNameProp: 'date',
    inputIdProp: 'date',
    inputPlaceholderProp: 'Select Date',
    inputDateFormatProp: {
        timeZoneName: 'short',
        day: 'numeric',
        month: 'narrow',
        year: 'numeric',
    },
}
