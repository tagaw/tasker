import { Form, Outlet, redirect, useLoaderData, useLocation } from "react-router-dom";
import Dropdown from "../components/Dropdown";
import { getNavData, newNote, NoteObj } from "../Note";
import { matchSorter } from "match-sorter";
import { useEffect, useRef, useState } from "react";

export async function loader({ request } : {request : Request}) {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');

    const [pinned,notes] = await getNavData(query);

    return [pinned,notes];
}

export const action = async () => {
    const note = await newNote();
    const [year,month, date, id] = note.id.split('-');
    return redirect(`/${year}/${month}/${date}/${id}/edit`);
} 

function Root() {
    const [pinned,notes] = useLoaderData() as [NoteObj[],NoteObj[]];

    return (
        <>
            <div className="flex flex-row w-full h-full max-w-full overflow-hidden">
                <div className="flex flex-col h-full bg-gray-400 basis-1/5 min-w-64 max-w-[30%]">
                    {/* Search / Add interaction */}
                    <div className="flex flex-row items-center w-full">
                        <Form id="search-form" role="search">
                            <input
                            className="pl-6 m-4 w-44 focus:outline-none active::border-0"
                            id="query"
                            aria-label="Search contacts" 
                            placeholder="Search"
                            type="search"
                            name="query"/>
                        </Form>
                    
                        <Form method="post" className="flex justify-center">
                            <button className="w-8 h-6 bg-black border-2 border-gray-600 rounded-lg bg-opacity-15" type="submit">
                                {/* Plus icon */}
                                <svg className="w-4 h-4 mx-auto fill-gray-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
                            </button>
                        </Form>
            
                    </div>

                    {/* Nav bar */}
                    {/* Double div wrapper to prevent CLS caused by scrollbar when it appears */}
                    <div className="flex flex-col w-full pl-4 overflow-x-hidden overflow-y-auto">
                        <div className="space-y-4 w-60">
                           {pinned.length > 0 && <Dropdown title="pinned" posts={pinned}></Dropdown>}

                           {notes.length > 0 && <Dropdown title="notes" posts={notes}></Dropdown>}
                        </div>

                    </div>
                </div>

                <div className="flex h-full overflow-x-hidden overflow-y-hidden basis-4/5 bg-slate-100">
                    <Outlet/>
                </div>
            </div>
            
        </>
    );
}

export default Root;
