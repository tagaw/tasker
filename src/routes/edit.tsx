import { ActionFunction, ActionFunctionArgs, Form, redirect, useLoaderData, useNavigate } from "react-router-dom"
import { NoteObj, EditNote as EditNoteObj, updateNote } from "../Note"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Timer, { createDateString } from "../components/Timer";
import { clear } from "localforage";


export const action: ActionFunction = async ({ request, params }: ActionFunctionArgs) => {
    const formData = await request.formData();

    let formObj = Object.fromEntries(formData);

    const DATE = new Date(formObj.edited as string);
    const PINNED = formObj.pinned === 'true';
    const TITLE = formObj.title as string;
    const CONTENT = formObj.content as string;

    const updates: EditNoteObj = {
        dateEdited: DATE,
        pinned: PINNED,
        title: TITLE,
        content: CONTENT
    }

    const NOTE_ID = [params.year, params.month, params.day, params.id];

    await updateNote(NOTE_ID.join('-'), updates);

    return redirect(`/${NOTE_ID.join('/')}`);
}

export default function EditNote() {
    const { note } = useLoaderData() as { note: NoteObj };

    const navigate = useNavigate();

    const [pin,setPin] = useState(note.pinned);

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

    function contentSync(event: ChangeEvent) {
        const currVal = (event.target as HTMLInputElement).value;

        if (currVal !== note.content) {
            contentChangeRef.current = true;
        } else {
            contentChangeRef.current = false;
        }

        setContent(currVal);
    }

    // 'autosave' every 2 seconds
    useEffect(() => {
        const cooldown = setInterval(() => {
            const textarea = document.getElementById('_content') as HTMLTextAreaElement;
            const currVal = textarea.value;

            if (currVal !== note.content) {
                contentChangeRef.current = true;
            } else {
                contentChangeRef.current = false;
            }

            setContent(currVal);
        }, 2000);

        return () => clearInterval(cooldown);
    }, []);

    return (
        <>
            <Form className="flex flex-col w-full h-full bg-slate-200" id="_editForm" method='post'>

                {/* header */}
                <div className="flex justify-center flex-none w-full h-24 bg-slate-300">
                    <div className="flex flex-row items-end justify-between w-[90%]">
                        <div className="flex flex-row flex-shrink-0 w-1/2 mb-1 text-2xl font-semibold">
                            {/* PIN BUTTON */}
                            <button type='button' value={pin ? 'false' : 'true'} className="w-8 h-8 align-text-bottom border border-black rounded-lg" onClick={() => setPin(!pin)}>
                                {pin ?  "★" : "☆"}
                            </button>
                            <input name="pinned" value={pin ? 'true' : 'false'} className="hidden"/>
                            
                            {/* TITLE */}
                            <input id='_title' name="title" value={title} onChange={handleTitleChange} className="w-4/5 pl-2 overflow-hidden text-ellipsis bg-inherit" />
                        </div>
                        <div className="relative w-[16.5rem] h-full">
                            {/* SAVE BUTTON */}
                            <button type='submit' className="absolute top-0 right-0 h-8 m-4 text-center border border-black rounded-lg w-14">SAVE</button>

                            {/* CANCEL BUTTON */}
                            <button type='button' className="absolute top-0 w-20 h-8 m-4 text-center text-red-700 bg-red-700 border border-red-700 rounded-lg right-16 bg-opacity-20" onClick={() => navigate(-1)}>CANCEL</button>

                            {/* EDIT DATE */}
                            <p className="absolute bottom-0 w-full px-4 text-right">
                                Last Edited: {contentChangeRef.current || titleChangeRef.current ? <Timer /> : <span>{default_date}</span>}
                            </p>

                        </div>
                    </div>
                </div>

                <div className="flex flex-col w-full overflow-y-auto bg-inherit">
                    <div className="relative flex-1 w-4/5 pb-6 mx-auto my-6 break-words h-fit">
                        <div className="invisible w-full p-2 mb-8 text-lg break-words whitespace-pre text-wrap h-fit">{content}</div>
                        <div className="w-full h-32"></div>

                        <textarea id='_content' name='content' defaultValue={content} onBlur={contentSync} className="absolute top-0 w-full h-full p-2 text-lg break-words whitespace-pre-line text-wrap bg-inherit" />
                    </div>
                </div>

                <input className="hidden" name='edited' value={contentChangeRef.current ? new Date().toISOString() : note.dateEdited.toISOString()} />
            </Form>
        </>
    )
}