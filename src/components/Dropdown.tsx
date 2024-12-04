import { useEffect, useRef, useState } from "react";
import { NoteObj } from '../Note'
import { Link, NavLink, useLocation } from "react-router-dom";

interface Props {
    title: string,
    posts: NoteObj[],
    opened?: boolean;
}

function genLink(note_id: string) {
    const link_segments = note_id.split('-');

    return link_segments.join('/');
}

function Dropdown( {title, posts}: Props) {
    const [open,setOpen] = useState(false);
    const toggleRef = useRef(false);

    const location = useLocation();

    const linkRef = useRef('/');

    // path = /YYYY/MM/DD/ID -> ["",YYYY,MM,DD,ID] -> [YYYY,MM,DD,ID] -> YYYY-MM-DD-ID
    const path = location.pathname.split('/');
    path.shift();

    let curr_id = path.join('-');
    
    if (location.pathname != linkRef.current) {
        linkRef.current = location.pathname;
        toggleRef.current = false;
    }

    useEffect(() =>{// if link is in posts start it opened. if link changes wipe component memory and start open
    if (!toggleRef.current && (posts.find((note) => note.id === curr_id) !== undefined)) {
        console.log("fucking reload bruh");
        toggleRef.current = true;
        setOpen(true);
    }
    },[linkRef.current]);
    
    return (
        <>
        <div className="flex flex-col w-4/5 my-2 rounded-lg h-fit bg-slate-300">
            <div className="rounded-lg hover-mask" onClick={() => {setOpen(!open)}}>{title}</div>
            {open && 
                (<ul className="overflow-y-auto rounded-lg bg-inherit h-fit">
                    {posts.map((note,idx) => 
                        <NavLink className="w-full" to={genLink(note.id)} key={idx}>
                            {
                            ({isActive}) => { 
                                if (isActive) {
                                    return <li className="w-full pl-3 my-2 overflow-hidden bg-black hover-mask bg-opacity-15 text-ellipsis" >{note.title || "No Title"}</li>;
                                }
                                return <li className="w-full pl-3 my-2 overflow-hidden hover-mask text-ellipsis" >{note.title || "No Title"}</li>;
                            }}
                        </NavLink>
                        )}
                </ul>)
            }
        </div>
        </>
    )
}

export default Dropdown;