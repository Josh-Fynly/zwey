"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
collection,
getDocs
} from "firebase/firestore";

import { db } from "../../lib/firebase";


export default function ExplorePage(){

const [artists,setArtists] = useState([]);
const [loading,setLoading] = useState(true);


useEffect(()=>{

fetchArtists();

},[]);



async function fetchArtists(){

try{

const snapshot = await getDocs(
collection(db,"users")
);


const users = snapshot.docs.map(doc=>({

id:doc.id,
...doc.data()

}));


setArtists(users);

}

catch(err){

console.error(err);

}

finally{

setLoading(false);

}

}




function initials(name=""){

return name
.split(" ")
.map(n=>n[0])
.slice(0,2)
.join("")
.toUpperCase();

}




function avatarColor(username=""){

const colors=[

"bg-blue-500",
"bg-purple-500",
"bg-green-500",
"bg-pink-500",
"bg-indigo-500",
"bg-cyan-500"

];


let hash=0;


for(let i=0;i<username.length;i++){

hash=username.charCodeAt(i)+((hash<<5)-hash);

}


return colors[
Math.abs(hash)%colors.length
];


}



if(loading){

return(

<div className="min-h-screen flex items-center justify-center">

<p>

Loading artists...

</p>

</div>

)

}





return(

<div className="min-h-screen bg-gray-50 p-6">


<div className="max-w-6xl mx-auto">


<h1 className="text-4xl font-bold mb-2">

Explore Artists

</h1>


<p className="text-gray-500 mb-10">

Discover creators on Zwey

</p>




<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">


{artists.map((artist)=>(



<Link


key={artist.id}

href={`/u/${artist.username}`}



>


<div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 h-full">


<div className="flex flex-col items-center">


{artist.pic_url ? (

<img

src={artist.pic_url}

alt={artist.artistName}

className="w-24 h-24 rounded-full object-cover mb-4"

/>

):(


<div


className={`

w-24
h-24
rounded-full
text-white
font-bold
text-xl
flex
items-center
justify-center
mb-4


${avatarColor(artist.username)}

`}


>

{initials(artist.artistName)}


</div>

)}




<h2 className="font-bold text-xl">

{artist.artistName}

</h2>



<p className="text-gray-500">

@{artist.username}

</p>




{artist.genre && (

<div className="mt-3">


<span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs">

{artist.genre}

</span>


</div>

)}




{artist.bio && (

<p className="text-sm text-gray-600 mt-4 line-clamp-3 text-center">


{artist.bio}


</p>

)}






</div>

</div>


</Link>



))}



</div>

</div>

</div>

);


  }
