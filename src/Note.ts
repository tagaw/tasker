import localforage from "localforage";
import { matchSorter } from "match-sorter";

export interface NoteObj {
    id: string;
    dateCreated: Date;
    dateEdited: Date;
    pinned: boolean;
    title: string;
    content: string;
}

export interface EditNote {
    dateEdited: Date;
    pinned: boolean;
    title: string;
    content: string;
}

interface StoredNote {
    STORAGE: {
        [YEAR: number | string ]: {
            [MONTH: number | string]: {
                [DATE: number | string]: NoteObj[];
            };
        };
    };
    COUNT: number;
    LAST_EDIT: Date;
}


interface CNOTE {
    notes: NoteObj[];
    pinned: NoteObj[];
    timestamp: Date | null;
}


//  DEBUG FUNCTIONS
function _TEMP_CREATE_NOTEOBJ(id: number, title: string, content: string) {
    let obj: NoteObj = {
        id: `2024-10-23-${id}`,
        dateCreated: new Date(),
        dateEdited: new Date(),
        pinned: true,
        title: title,
        content: content
    }

    return obj;
}

//  DEBUG
const _TEMP_DATA: StoredNote = {
    STORAGE: { 
        2024: {
            10: {
                23:
                    [_TEMP_CREATE_NOTEOBJ(1,"lol1","hello world"),_TEMP_CREATE_NOTEOBJ(2,"lol2","hello world"),_TEMP_CREATE_NOTEOBJ(3,"lol3","hello world"),_TEMP_CREATE_NOTEOBJ(4,"lol4","hello world"),_TEMP_CREATE_NOTEOBJ(5,"lol5","hello world"),_TEMP_CREATE_NOTEOBJ(6,"lol6","hello world"),_TEMP_CREATE_NOTEOBJ(7,"lol7","hello world"),_TEMP_CREATE_NOTEOBJ(8,"lol8","hello world")]
            }
        }
    },
    COUNT: 10,
    LAST_EDIT: new Date()
}

/* UNCOMMENT VVV TO START WITH ENTRIES */
// localforage.setItem('StoredNotes',_TEMP_DATA);

// LOCAL RUNTIME 
const consolidated_notes: CNOTE = { notes: [], pinned: [], timestamp: null };

// PRIVATE UTILITY FUNCTIONS

function _syncNotes(storedNotes: StoredNote) {
// Gathers all note objects as needed for query purposes

    if (consolidated_notes.timestamp == null || storedNotes.LAST_EDIT != consolidated_notes.timestamp) {
        
        let noteStubs: NoteObj[] = [];
        let pinnedNotes: NoteObj[] = [];
        const storage = storedNotes.STORAGE;
        
        const YEARS = Object.keys(storage);
        if (YEARS) {
            for (let years of YEARS) {
                const MONTHS = Object.keys(storage[years]);

                for (let months of MONTHS) {
                    const DAYS = Object.keys(storage[years][months]);

                    for (let days of DAYS) {
                        
                        for (let note of storage[years][months][days]) {
                            if (!note.pinned) {
                                noteStubs.push(note);
                            }  else {
                                pinnedNotes.push(note);
                            }
                        }
                            
                    }
                }
            }
        }
        consolidated_notes.pinned = pinnedNotes;
        consolidated_notes.notes = noteStubs;
        consolidated_notes.timestamp = storedNotes.LAST_EDIT;
    }
    return ;
}

async function grabSync() {
// Grabs and returns Stored Notes after Syncing local cache
    let storedData = await getStorage();
    _syncNotes(storedData);
    
    return storedData;
}

function genID(time: Date, idx: number) {
// generates an ID in the form YYYY-MM-DD-NoteIDX
    return `${time.getFullYear()}-${time.getMonth()}-${time.getDate()}-${idx+1}`;
}

async function getStorage() {
// grabs/creates a local forage instance of note storage
    let storage = await localforage.getItem('StoredNotes') as StoredNote;
    if (!storage){
        localforage.setItem('StoredNotes',{STORAGE: {}, COUNT: 0});
        storage = {STORAGE: {}, COUNT: 0, LAST_EDIT: new Date}
    }
    
    return storage;
}


async function getCurrentNotes(time: Date): Promise<[StoredNote,NoteObj[]]> {
/* 
Returns a notes array for the stored entry of the current date. 
If the current date is not an existing stored entry, create a new one.
*/
    let storedData = await getStorage();

    let storage = storedData.STORAGE;

    const year = time.getFullYear();
    const month = time.getMonth();
    const date = time.getDate();
    
    if (!(year in storage)) {
        storage[year] = {};
    }
    if (!(month in storage[year])) {
        storage[year][month] = {};
    }
    if (!(date in storage[year][month])) {
        storage[year][month][date] = [];
    }


    return [storedData, storage[year][month][date]];
}

// ACCESS / MODIFICATION INTERFACE FUNCTIONS
export async function getNavData(query: string | null) {
    await grabSync();

    let [favorites, noteStubs] = [consolidated_notes.pinned, consolidated_notes.notes];

    if (query) {
        noteStubs = matchSorter(noteStubs, query, { keys: ['title','content']});
    }
    console.log("searching:",query);
    return [ favorites, noteStubs ]   
}


export async function newNote() {
    const current_time = new Date();
    
    let [storedData, noteArr] = await getCurrentNotes(current_time);

    let new_note: NoteObj = { 
        id: genID(current_time,noteArr.length),
        dateCreated: current_time,
        dateEdited: current_time,
        pinned: false,
        title: "",
        content: "" 
    };

    noteArr.push(new_note);

    // Update meta-data so that syncNotes() can update temp copy
    storedData.LAST_EDIT = current_time;
    storedData.COUNT += 1;
    await localforage.setItem('StoredNotes',storedData);
    return new_note;
}

export async function getNote(id:string) {
    const storedData = await getStorage();

    return _getNote(id,storedData);
}

async function _getNote(id:string, storedData: StoredNote) {
    // Helper function to edit a note
    const [year,month,day,_] = id.split('-');

    let note = storedData.STORAGE[year][month][day].find(n => n.id === id);

    if (!note) throw new Error(`No note entry found for ID:${id}`);

    return note ?? null;
}

export async function updateNote(id:string, update: EditNote | NoteObj) {
    let storedData = await getStorage();

    let note = await _getNote(id,storedData);
    
    Object.assign(note,update);

    // Update meta-data so that syncNotes() can update temp copy
    storedData.LAST_EDIT = update.dateEdited;

    await localforage.setItem('StoredNotes',storedData);
    return note;
}
