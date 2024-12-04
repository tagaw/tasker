import { ActionFunction, ActionFunctionArgs, Form, useFetcher, useLoaderData } from "react-router-dom";
import { getNote, newNote, NoteObj, updateNote } from "../Note";

interface Params {
    id: string | number;
    day: string | number;
    month: string | number;
    year: string | number;
}

export async function loader({ params }: any | Params) {
    const note = await getNote(`${params.year}-${params.month}-${params.day}-${params.id}`);
    // console.log(params);
    if (!note) {
        throw new Response("", {
            status: 404,
            statusText: "Not Found",
        });
    }
    return { note };
}

export const action: ActionFunction = async ({ request, params }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const NOTE_ID = [params.year,params.month,params.day,params.id].join('-');

    let note = await getNote(NOTE_ID);

    note.pinned = (formData.get('pinned') === 'true');

    return updateNote(NOTE_ID,note)
}


export default function Note() {
    const { note } = useLoaderData() as { note: NoteObj };

    function createDateString(date: Date) {
        const hours = date.getHours();
        let ret = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() % 100} | ${hours % 12 === 0 ? 12 : hours % 12}:${date.getMinutes() < 10 ? 0 : ""}${date.getMinutes()} ${hours >= 12 ? 'PM' : "AM"}`;
        return ret;
    }

    return (
        <>
            <div className="flex flex-col w-full h-full bg-slate-200">
                {/* header */}
                <div className="flex justify-center flex-none w-full h-24 bg-slate-300">
                    <div className="flex flex-row items-end justify-between w-[90%]">
                        <div className="flex flex-row flex-shrink-0 w-1/2 mb-1 text-2xl font-semibold">
                            {/* PIN BUTTON */}
                            <Pin note={note}/>
                            {/* TITLE */}
                            <p className="w-4/5 pl-2 overflow-hidden text-ellipsis">{note.title} </p>
                        </div>
                        <div className="relative w-[16.5rem] h-full">
                            {/* EDIT BUTTON */}
                            <Form action="edit" >
                                <button type='submit' className="absolute top-0 right-0 h-8 m-4 text-center border border-black rounded-lg w-14">EDIT</button>
                            </Form>
                            {/* EDIT DATE */}
                            <p className="absolute bottom-0 w-full px-4 text-right">
                                Last Edited: {createDateString(note.dateEdited)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full overflow-y-auto bg-inherit">
                    <div className="pb-6 my-6 break-words text-wrap">
                        <p className="w-4/5 mx-auto text-lg">{note.content}</p>
                    </div>
                </div>
            </div>
        </>
    )
}

interface P {
    note: NoteObj;
}

function Pin({ note } : P ) {
    const fetcher = useFetcher();
    const pinned = fetcher.formData ? fetcher.formData.get('pinned') === 'true' : note.pinned;

    return (
        <>
        <fetcher.Form method="post">
            <button name="pinned" value={pinned ? 'false' : 'true'} className="w-8 h-8 align-text-bottom border border-black rounded-lg">
                {pinned ?  "★" : "☆"}
            </button>
        </fetcher.Form>
        </>
    )
}