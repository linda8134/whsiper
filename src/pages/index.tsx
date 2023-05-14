import { useZupass, ZupassLoginButton } from "zukit";
import { useSearchParams } from "next/navigation";
import {useEffect, useState, useCallback} from 'react';
import qs from 'qs';
import axios from 'axios';
import logoIcon from '../assets/logo.png';
import Image from "next/image";

export default function Home() {
  const [zupass] = useZupass();
  const { status } = zupass;
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  useEffect(() => {
    if(!chatId){
      return ;
    }
    localStorage.setItem('chatId', chatId)
  },[chatId])

  useEffect(() => {
    if(status !== 'logged-in'){
      return;
    }
    handleSyncLogedUser({chatid: chatId, passid: zupass.pcd.id})
  },[status, chatId])

  const handleSyncLogedUser = useCallback((params:any) => {
    if(!chatId){
      return ;
    }
    axios.get(`https://8.217.92.45:9529/zupass?${qs.stringify(params)}`, {headers: {'Access-Control-Allow-Origin': '*'}}).then(resp => {
      console.log(resp)
    }).catch(error => {
      console.log(error)
    })
  },[chatId])
  return (
    <div className="min-h-screen px-4 py-8 flex justify-center items-center">
      <main className="flex flex-col bg-gray-100 items-center gap-8 rounded-2xl max-w-screen-sm mx-auto p-9">
        <Image
          className="inline-block my-1"
          src={logoIcon}
          width={300}
          alt="Whisper"
          priority
        />
        {status === 'logged-in' ? null : <h1 className="font-bold text-2xl">Login</h1>}
        <div className="flex flex-row gap-8 items-baseline">
          {(zupass.status === "logged-out" || zupass.anonymous) && (
            <ZupassLoginButton anonymous className='primaryButton'/>
          )}
        </div>
        <Status />
      </main>
    </div>
  );
}

function Status() {
  const [zupass] = useZupass();
  const { status } = zupass;
  switch (status) {
    case "logged-out":
    case "logging-in":
      return null;
    case "logged-in":
      if (zupass.anonymous) {
        return (
          <div className="flex flex-col gap-2">
            <div>✅ Valid zero-knowledge proof</div>
            <div>
              👁️‍🗨️ Anonymity set <strong>{zupass.group.name}</strong>
            </div>
            <div>🕶️ You are one of {zupass.group.members.length} members</div>
          </div>
        );
      } else {
        return (
          <div className="flex flex-col gap-2">
            <div>✅ Valid zero-knowledge proof</div>
            <div>
              👋 Welcome, <strong>{zupass.participant.name}</strong>
              <Pellet>{zupass.participant.role}</Pellet>
            </div>
            <div>🖋️ Email {zupass.participant.email}</div>
            <div>👓 UUID {zupass.participant.uuid}</div>
          </div>
        );
      }
    default:
      throw new Error(`Invalid status ${status}`);
  }
}

function Pellet({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-md px-2 text-sm font-bold ml-2">
      {children}
    </span>
  );
}
