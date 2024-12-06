import { deleteNote } from "../Note";
import { ActionFunction, ActionFunctionArgs, redirect } from "react-router-dom";


export const action: ActionFunction = async ({ params }: ActionFunctionArgs) => {
    const NOTE_ID = [params.year,params.month,params.day,params.id].join('-');

    await deleteNote(NOTE_ID);

    return redirect('/');
}