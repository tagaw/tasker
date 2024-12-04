import { useEffect, useState } from "react";


export function createDateString(date: Date) {
    const hours = date.getHours();
    let ret = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() % 100} | ${hours % 12 === 0 ? 12 : hours % 12}:${date.getMinutes() < 10 ? 0 : ""}${date.getMinutes()} ${hours >= 12 ? 'PM' : "AM"}`;
    return ret;
}

export default function Timer() {
    const [time,setTime] = useState(createDateString(new Date()));

    // Inline clock that updates every 2.5 sec, arbitrary val btw
    useEffect(() => {
        setInterval(() => {
            const now = new Date();
            setTime(createDateString(now));
        },2500);
        
    });

    return (
        <span>{time}</span>
    )
}