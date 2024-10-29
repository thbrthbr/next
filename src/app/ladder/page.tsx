'use client';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { LoginStore } from '@/data/store';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import googleLogin from '@/asset/googlethumbnail.png';
import emailjs from 'emailjs-com';
import Select from 'react-select';
import { IoIosClose } from 'react-icons/io';
import styled from 'styled-components';
import { MdOutlineFileUpload } from 'react-icons/md';
import { ClipLoader } from 'react-spinners';

export default function Ladder() {
  const { data: session } = useSession();
  const [isCssLoaded, setIsCssLoaded] = useState(false);
  const [ladder, setLadder] = useState<any>([]);
  const [option, setOption] = useState<any>([]);
  const [uploadScreen, setUploadScreen] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(0);
  const [way, setWay] = useState('로비채팅');
  const [todayRecord, setTodayRecord] = useState('');
  const [eachSeasonData, setEachSeasonData] = useState<any>([]);
  const [currentBanner, setCurrentBanner] = useState('');
  const [lastSeason, setLastSeason] = useState(0);
  const [lastSeasonData, setLastSeasonData] = useState<any>({});
  const [lastUpdate, setLastUpdate] = useState('not yet');

  const dateMaker = (num: number) => {
    const date = new Date(num);

    // 각 요소를 추출
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // "년도-월-일 시:분" 형식으로 변환
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedDate;
  };

  const basicSetting = async () => {
    let result = await fetch(`http://localhost:3000/api/ladder`, {
      method: 'GET',
      cache: 'no-store',
    });
    let final = await result.json();
    let seasons = final.data.sort((x: any, y: any) => y.season - x.season);
    let temp: any = [];
    setOption(
      seasons.map((each: any) => {
        temp.push({ season: each.season, banner: each.banner });
        return { value: each.season, label: '시즌 ' + each.season };
      }),
    );
    setEachSeasonData(temp);
    setLastSeason(seasons[0].season);
    getLadder(seasons[0].season, seasons[0].season);
    checkCssLoaded();
  };

  const getLadder = async (season: number, latest: number) => {
    setCurrentSeason(season);
    let result = await fetch(`http://localhost:3000/api/ladder/${season}`, {
      method: 'GET',
      cache: 'no-store',
    });
    let final = await result.json();
    let ladderData = final.data.slice();
    ladderData.sort((x: any, y: any) => y.score - x.score);
    let rank = 0;
    let beforeRank = Infinity;
    for (let i = 0; i < ladderData.length; i++) {
      if (ladderData[i].score < beforeRank) {
        rank++;
      }
      ladderData[i].rank = rank;
      if (String(ladderData[i].score).includes('.')) {
        ladderData[i].score = String(ladderData[i].score).padEnd(8, '0');
      } else {
        let processing = String(ladderData[i].score) + '.';
        ladderData[i].score = processing.padEnd(8, '0');
      }
      beforeRank = ladderData[i].score;
    }
    if (ladderData.length > 0 && ladderData[0].season >= latest) {
      setLastSeason(ladderData[0].season);
      let ldata: any = {};
      for (let i = 0; i < ladderData.length; i++) {
        ldata[ladderData[i].user] = Number(ladderData[i].score);
      }
      setLastSeasonData(ldata);
    }
    if (ladderData.length > 0) {
      let forTime = ladderData
        .slice(0)
        .sort((x: any, y: any) => y.timestamp - x.timestamp);
      setLastUpdate(dateMaker(forTime[0].timestamp));
    } else {
      setLastUpdate('not yet');
    }

    setLadder(ladderData);
    if (ladderData.length > 0 && ladderData[0].season >= latest) {
      decay(ladderData[0].season);
    }
  };

  const updateLadder = async () => {
    let splited = todayRecord.split('\n');
    let updatedUsersToday: any = {};
    let updated = { ...lastSeasonData };
    if (way == '로비채팅') {
      for (let i = 0; i < splited.length; i++) {
        if (
          splited[i].includes('has') &&
          splited[i].includes('match') &&
          splited[i].includes('won') &&
          !splited[i].includes(':')
        ) {
          let winner = splited[i].split('has')[0].trim().toLowerCase();
          let loser = splited[i]
            .split('against')[1]
            .trim()
            .slice(0, -1)
            .toLowerCase();
          let winnerScore = 0;
          let loserScore = 0;
          if (updated[winner]) winnerScore = updated[winner];
          else {
            updated[winner] = 1500;
            winnerScore = 1500;
          }
          if (updated[loser]) loserScore = updated[loser];
          else {
            updated[loser] = 1500;
            loserScore = 1500;
          }
          let ubaiai = 16 + (loserScore - winnerScore) / 25;
          ubaiai = Number(ubaiai.toFixed(3));
          if (ubaiai <= 0) {
            updated[winner] += 1;
            updated[loser] -= 1;
          } else {
            if (ubaiai > 32) {
              updated[winner] += 32;
              updated[loser] -= 32;
            } else {
              updated[winner] += ubaiai;
              updated[loser] -= ubaiai;
            }
          }
          updatedUsersToday[winner] = updated[winner];
          updatedUsersToday[loser] = updated[loser];
        } else if (
          splited[i].includes('has') &&
          splited[i].includes('match') &&
          splited[i].includes('lost') &&
          !splited[i].includes(':')
        ) {
          let loser = splited[i].split('has')[0].trim().toLowerCase();
          let winner = splited[i]
            .split('against')[1]
            .trim()
            .slice(0, -1)
            .toLowerCase();
          let winnerScore = 0;
          let loserScore = 0;
          if (updated[winner]) winnerScore = updated[winner];
          else {
            updated[winner] = 1500;
            winnerScore = 1500;
          }
          if (updated[loser]) loserScore = updated[loser];
          else {
            updated[loser] = 1500;
            loserScore = 1500;
          }
          let ubaiai = 16 + (loserScore - winnerScore) / 25;
          ubaiai = Number(ubaiai.toFixed(3));
          if (ubaiai <= 0) {
            updated[winner] += 1;
            updated[loser] -= 1;
          } else {
            if (ubaiai > 32) {
              updated[winner] += 32;
              updated[loser] -= 32;
            } else {
              updated[winner] += ubaiai;
              updated[loser] -= ubaiai;
            }
          }
          updatedUsersToday[winner] = updated[winner];
          updatedUsersToday[loser] = updated[loser];
        }
      }
    }
    if (way == '로그') {
      for (let i = 0; i < splited.length; i++) {
        if (splited[i].includes('battleend') && splited[i].includes('win')) {
          let secondTask = splited[i].split('|');
          let winner = secondTask[3].toLowerCase();
          let loser = secondTask[4].toLowerCase();
          let winnerScore = 0;
          let loserScore = 0;
          if (updated[winner]) winnerScore = updated[winner];
          else {
            updated[winner] = 1500;
            winnerScore = 1500;
          }
          if (updated[loser]) loserScore = updated[loser];
          else {
            updated[loser] = 1500;
            loserScore = 1500;
          }
          let ubaiai = 16 + (loserScore - winnerScore) / 25;
          ubaiai = Number(ubaiai.toFixed(3));
          if (ubaiai <= 0) {
            updated[winner] += 1;
            updated[loser] -= 1;
          } else {
            if (ubaiai > 32) {
              updated[winner] += 32;
              updated[loser] -= 32;
            } else {
              updated[winner] += ubaiai;
              updated[loser] -= ubaiai;
            }
          }
          updatedUsersToday[winner] = updated[winner];
          updatedUsersToday[loser] = updated[loser];
        } else if (
          splited[i].includes('battleend') &&
          splited[i].includes('loss')
        ) {
          let secondTask = splited[i].split('|');
          let winner = secondTask[4].toLowerCase();
          let loser = secondTask[3].toLowerCase();
          let winnerScore = 0;
          let loserScore = 0;
          if (updated[winner]) winnerScore = updated[winner];
          else {
            updated[winner] = 1500;
            winnerScore = 1500;
          }
          if (updated[loser]) loserScore = updated[loser];
          else {
            updated[loser] = 1500;
            loserScore = 1500;
          }
          let ubaiai = 16 + (loserScore - winnerScore) / 25;
          ubaiai = Number(ubaiai.toFixed(3));
          if (ubaiai <= 0) {
            updated[winner] += 1;
            updated[loser] -= 1;
          } else {
            if (ubaiai > 32) {
              updated[winner] += 32;
              updated[loser] -= 32;
            } else {
              updated[winner] += ubaiai;
              updated[loser] -= ubaiai;
            }
          }
          updatedUsersToday[winner] = updated[winner];
          updatedUsersToday[loser] = updated[loser];
        }
      }
    }
    //소수점뒤 세자리만 남기는 작업
    for (let i in updatedUsersToday) {
      updatedUsersToday[i] = Number(updatedUsersToday[i].toFixed(3));
    }
    let result = await fetch(`http://localhost:3000/api/ladder`, {
      method: 'POST',
      body: JSON.stringify([updatedUsersToday, lastSeason]),
      cache: 'no-store',
    });
    let final = await result.json();
    console.log(final);
    alert('점수가 업데이트 되었습니다');
    window.location.reload();
  };

  const checkCssLoaded = () => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setIsCssLoaded(true));
    } else {
      setIsCssLoaded(true);
    }
  };

  const decay = async (season: number) => {
    let result = await fetch(`http://localhost:3000/api/decay`, {
      method: 'POST',
      body: JSON.stringify([season]),
      cache: 'no-store',
    });
    let final = await result.json();
  };

  useEffect(() => {
    basicSetting();
  }, []);

  useEffect(() => {
    if (session) {
      console.log(session.user.role);
    }
  }, [session]);

  useEffect(() => {
    if (eachSeasonData.length > 0) {
      setCurrentBanner(
        eachSeasonData[eachSeasonData.length - currentSeason].banner,
      );
    }
  }, [currentSeason]);

  if (!isCssLoaded) {
    return (
      <div
        style={{
          width: '100%',
          height: '90vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ClipLoader
          color="red"
          size={100}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  return (
    <div className="main-page font-insert-2">
      {/* <button
        onClick={() => {
          TempUpdateLadder(5);
        }}
      >
        임시
      </button> */}
      <br></br>
      {uploadScreen == true && (
        <div className="ladder-upload-screen">
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'end',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              setUploadScreen(false);
            }}
          >
            <IoIosClose />
          </div>
          <textarea
            className="ladder-upload-textarea"
            value={todayRecord}
            onChange={(e) => {
              setTodayRecord(e.target.value);
            }}
          ></textarea>
          <br></br>
          <div className="ladder-upload-radio">
            <div>
              <input
                type="radio"
                name="way"
                value="로비채팅"
                checked={way === '로비채팅'}
                onChange={(e: any) => {
                  setWay(e.target.value);
                }}
              ></input>
              로비채팅
            </div>
            <div>
              <input
                type="radio"
                name="way"
                value="로그"
                checked={way === '로그'}
                onChange={(e: any) => {
                  setWay(e.target.value);
                }}
              ></input>
              로그
            </div>
          </div>
          <br></br>
          <button onClick={updateLadder}>업데이트</button>
        </div>
      )}

      <div>
        <img className="ladder-banner" src={currentBanner} />
      </div>
      <br></br>
      <div className="ladder-season-title">SEASON {currentSeason}</div>
      <br></br>
      {ladder.length > 0 ? (
        <table className="ladder-table">
          <thead>
            <tr className="ladder-table-tr">
              <th className="ladder-table-th">순위</th>
              <th className="ladder-table-th">닉네임</th>
              <th className="ladder-table-th">점수</th>
            </tr>
          </thead>
          <tbody>
            {ladder.map((each: any, idx: number) => {
              return (
                <tr key={idx}>
                  <td className="ladder-table-td">{each.rank}</td>
                  <td className="ladder-table-td">{each.user}</td>
                  <td className="ladder-table-td">{each.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <ClipLoader
          color="red"
          size={100}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      )}

      <div className="ladder-updated-date">last update : {lastUpdate}</div>
      <br></br>
      <div className="ladder-upper-part">
        <$Select
          options={option}
          onChange={(e: any) => {
            getLadder(e.value, option[0].season);
          }}
          placeholder={'시즌선택'}
        ></$Select>
        {(session?.user.role == 'staff' || session?.user.role == 'admin') && (
          <button
            onClick={(e) => {
              setUploadScreen(true);
            }}
            className="ladder-upload"
          >
            <MdOutlineFileUpload />
          </button>
        )}
      </div>
      <br></br>
    </div>
  );
}

const $Select = styled(Select)`
  color: black;
`;
