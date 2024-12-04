import { ActionFunction, ActionFunctionArgs, Form, redirect, useLoaderData } from "react-router-dom"
import { NoteObj, EditNote as EditNoteObj, updateNote } from "../Note"
import { ChangeEvent, useRef, useState } from "react";
import Timer,{createDateString} from "../components/Timer";


export const action: ActionFunction = async ({ request, params }: ActionFunctionArgs) => {
    const formData = await request.formData();
    
    let formObj = Object.fromEntries(formData);

    const DATE = new Date();
    const PINNED = formObj.pinned === 'true';
    const TITLE = formObj.title as string;
    const CONTENT = formObj.content as string;

    const updates: EditNoteObj = {
        dateEdited: DATE,
        pinned: PINNED,
        title: TITLE,
        content: CONTENT
    }

    const NOTE_ID = [params.year,params.month,params.day,params.id];

    await updateNote(NOTE_ID.join('-'),updates);

    return redirect(`/${NOTE_ID.join('/')}`);
}

export default function EditNote() {
    const { note } = useLoaderData() as { note: NoteObj };
    
    const default_date = createDateString(note.dateEdited);
    
    const [content, setContent] = useState(note.content);
    const contentChangeRef = useRef(false);
    
    const [title, setTitle] = useState(note.title);
    const titleChangeRef = useRef(false);

    function handleTitleChange(event: ChangeEvent) {
        event.preventDefault();
        const currVal = (event.target as HTMLInputElement).value;
        
        if (!titleChangeRef.current && currVal !== note.title) {
            titleChangeRef.current = true;
        } else if (titleChangeRef.current && currVal === note.title) {
            titleChangeRef.current = false;
        }
        
        setTitle(currVal);
    }
    
    function handleContentChange(event: ChangeEvent) {
        event.preventDefault();
        const currVal = (event.target as HTMLInputElement).value;
        if (!contentChangeRef.current && currVal !== note.content) {
            contentChangeRef.current = true;
        } else if (contentChangeRef.current && currVal === note.content) {
            contentChangeRef.current = false;
        }
        
        setContent(currVal);
    }

    return (
        <>
        <Form className="flex flex-col w-full h-full bg-slate-200" id="_editForm" method='post'>
            
                {/* header */}
                <div className="flex justify-center flex-none w-full h-24 bg-slate-300">
                    <div className="flex flex-row items-end justify-between w-[90%]">
                        <div className="flex flex-row flex-shrink-0 w-1/2 mb-1 text-2xl font-semibold">
                            {/* PIN BUTTON */}
                            {/* TITLE */}
                            <input id='_title' name="title" value={title} onChange={handleTitleChange} className="w-4/5 pl-2 overflow-hidden text-ellipsis bg-inherit"/>
                        </div>
                        <div className="relative w-[16.5rem] h-full">
                            {/* EDIT BUTTON */}
                            <button type='submit' className="absolute top-0 right-0 h-8 m-4 text-center border border-black rounded-lg w-14">SAVE</button>
                           
                            {/* EDIT DATE */}
                            <p className="absolute bottom-0 w-full px-4 text-right">
                                Last Edited: {contentChangeRef.current || titleChangeRef.current ? <Timer/> : <span>{default_date}</span>}
                            </p>
                            
                        </div>
                    </div>
                </div>
     
                <div className="flex flex-col w-full min-h-full overflow-y-auto bg-inherit">
                    <div className="relative flex-1 w-4/5 pb-6 mx-auto my-6 break-words h-fit">
                        <div className="hidden w-full text-lg break-words text-wrap">{content}</div>                              
                        
                        <textarea id='_content' name='content' value={content} onChange={handleContentChange} className="absolute top-0 w-full h-full break-words"/>
                    </div>
                </div>        
        </Form>
        </>
    )
}