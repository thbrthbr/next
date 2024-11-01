'use client';
import Link from 'next/link';
import { LoginStore } from '@/data/store';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import googleLogin from '@/asset/googlethumbnail.png';
import emailjs from 'emailjs-com';

import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { db } from '../../data/PKDB';
import { typeIcons } from '../../data/ICDB';
import { toPng } from 'html-to-image';
import { MdOutlineEmail } from 'react-icons/md';
import { FaLanguage } from 'react-icons/fa';
import Select from 'react-select';
import { MdVerticalAlignTop } from 'react-icons/md';
import ClipLoader from 'react-spinners/ClipLoader';

export default function PreferDiagram() {
  console.log(db);
  const TestRef = useRef(null);
  const buttonRef = useRef(null);
  const topRef = useRef(null);

  let option = [
    { value: 'korean', label: '한국어' },
    { value: 'english', label: 'English' },
  ];

  let borderExsist = ['포켓몬테마', 'Pokémon'];
  let pokeTheme = ['몬스터볼테마', 'PokéBall'];

  const [isCssLoaded, setIsCssLoaded] = useState(false);
  const [themeColor, setThemeColor] = useState('aliceblue');
  const [themeTitleColor, setThemeTitleColor] = useState('black');
  const [themeBorderColor, setThemeBorderColor] = useState('aliceblue');
  const [themeDesc, setThemeDesc] = useState('');
  const [language, setLanguage] = useState('korean');
  const [grass, setGrass] = useState(db[0].url);
  const [water, setWater] = useState(db[0].url);
  const [fire, setFire] = useState(db[0].url);
  const [rock, setRock] = useState(db[0].url);
  const [electric, setElectric] = useState(db[0].url);
  const [ground, setGround] = useState(db[0].url);
  const [dark, setDark] = useState(db[0].url);
  const [fairy, setFairy] = useState(db[0].url);
  const [fighting, setFighting] = useState(db[0].url);
  const [psychic, setPsychic] = useState(db[0].url);
  const [steel, setSteel] = useState(db[0].url);
  const [bug, setBug] = useState(db[0].url);
  const [poison, setPoison] = useState(db[0].url);
  const [ghost, setGhost] = useState(db[0].url);
  const [normal, setNormal] = useState(db[0].url);
  const [ice, setIce] = useState(db[0].url);
  const [dragon, setDragon] = useState(db[0].url);
  const [flying, setFlying] = useState(db[0].url);
  let backgroundColors = [
    {
      color: 'aliceblue',
      titleColor: 'black',
      borderColor: 'aliceblue',
      desc: language == 'korean' ? '기본' : 'Standard',
    },
    {
      color: '#181677',
      titleColor: 'white',
      borderColor: '#181677',
      desc: language == 'korean' ? '군청' : 'Navy',
    },
    {
      color: 'black',
      titleColor: 'white',
      borderColor: 'black',
      desc: language == 'korean' ? '모노톤' : 'Monochrome',
    },
    {
      color: '#6D3A7C',
      titleColor: 'black',
      borderColor: '#6D3A7C',
      desc: language == 'korean' ? '메인테마' : 'Main',
    },
    {
      color: '#FFCC00',
      titleColor: '#3861AD',
      borderColor: '#3861AD',
      desc: language == 'korean' ? '포켓몬테마' : 'Pokémon',
    },
    {
      color: 'white',
      titleColor: 'black',
      borderColor: 'red',
      desc: language == 'korean' ? '몬스터볼테마' : 'PokéBall',
    },
  ];

  const types = [
    {
      type: '노말',
      color: '#999999',
      engType: 'normal',
      list: [] as any,
      func: setNormal,
      cur: normal,
    },
    {
      type: '불꽃',
      color: '#FF612C',
      engType: 'fire',
      list: [] as any,
      func: setFire,
      cur: fire,
    },
    {
      type: '물',
      color: '#2992FF',
      engType: 'water',
      list: [] as any,
      func: setWater,
      cur: water,
    },
    {
      type: '풀',
      color: '#42BF24',
      engType: 'grass',
      list: [] as any,
      func: setGrass,
      cur: grass,
    },
    {
      type: '전기',
      color: '#FFDB00',
      engType: 'electric',
      list: [] as any,
      func: setElectric,
      cur: electric,
    },
    {
      type: '얼음',
      color: '#42D8FF',
      engType: 'ice',
      list: [] as any,
      func: setIce,
      cur: ice,
    },
    {
      type: '격투',
      color: '#FFA202',
      engType: 'fighting',
      list: [] as any,
      func: setFighting,
      cur: fighting,
    },
    {
      type: '독',
      color: '#994DCF',
      engType: 'poison',
      list: [] as any,
      func: setPoison,
      cur: poison,
    },
    {
      type: '땅',
      color: '#AB7939',
      engType: 'ground',
      list: [] as any,
      func: setGround,
      cur: ground,
    },
    {
      type: '비행',
      color: '#95C9FF',
      engType: 'flying',
      list: [] as any,
      func: setFlying,
      cur: flying,
    },
    {
      type: '에스퍼',
      color: '#FF637F',
      engType: 'psychic',
      list: [] as any,
      func: setPsychic,
      cur: psychic,
    },
    {
      type: '벌레',
      color: '#9FA424',
      engType: 'bug',
      list: [] as any,
      func: setBug,
      cur: bug,
    },
    {
      type: '바위',
      color: '#BCB889',
      engType: 'rock',
      list: [] as any,
      func: setRock,
      cur: rock,
    },
    {
      type: '고스트',
      color: '#6E4570',
      engType: 'ghost',
      list: [] as any,
      func: setGhost,
      cur: ghost,
    },
    {
      type: '드래곤',
      color: '#5462D6',
      engType: 'dragon',
      list: [] as any,
      func: setDragon,
      cur: dragon,
    },
    {
      type: '악',
      color: '#4F4747',
      engType: 'dark',
      list: [] as any,
      func: setDark,
      cur: dark,
    },
    {
      type: '강철',
      color: '#6AAED3',
      engType: 'steel',
      list: [] as any,
      func: setSteel,
      cur: steel,
    },
    {
      type: '페어리',
      color: '#FFB1FF',
      engType: 'fairy',
      list: [] as any,
      func: setFairy,
      cur: fairy,
    },
  ];

  for (let i = 0; i < db.length; i++) {
    if (db[i].type.includes('normal')) {
      types[0].list.push(db[i]);
    }
    if (db[i].type.includes('fire')) {
      types[1].list.push(db[i]);
    }
    if (db[i].type.includes('water')) {
      types[2].list.push(db[i]);
    }
    if (db[i].type.includes('grass')) {
      types[3].list.push(db[i]);
    }
    if (db[i].type.includes('electric')) {
      types[4].list.push(db[i]);
    }
    if (db[i].type.includes('ice')) {
      types[5].list.push(db[i]);
    }
    if (db[i].type.includes('fighting')) {
      types[6].list.push(db[i]);
    }
    if (db[i].type.includes('poison')) {
      types[7].list.push(db[i]);
    }
    if (db[i].type.includes('ground')) {
      types[8].list.push(db[i]);
    }
    if (db[i].type.includes('flying')) {
      types[9].list.push(db[i]);
    }
    if (db[i].type.includes('psychic')) {
      types[10].list.push(db[i]);
    }
    if (db[i].type.includes('bug')) {
      types[11].list.push(db[i]);
    }
    if (db[i].type.includes('rock')) {
      types[12].list.push(db[i]);
    }
    if (db[i].type.includes('ghost')) {
      types[13].list.push(db[i]);
    }
    if (db[i].type.includes('dragon')) {
      types[14].list.push(db[i]);
    }
    if (db[i].type.includes('dark')) {
      types[15].list.push(db[i]);
    }
    if (db[i].type.includes('steel')) {
      types[16].list.push(db[i]);
    }
    if (db[i].type.includes('fairy')) {
      types[17].list.push(db[i]);
    }
  }

  const exportElementAsPNG = () => {
    if (buttonRef.current) {
      (buttonRef.current as any).style.animation = 'jelly 0.5s';
    }
    (TestRef.current as any).style.display = 'block';
    (TestRef.current as any).style.fontFamily = 'monoton';
    toPng(TestRef.current as any).then((image) => {
      const link = window.document.createElement('a');
      link.download = 'PK-DIAGRAM.png';
      link.href = image;
      link.click();
      (TestRef.current as any).style.display = 'none';
    });
  };

  const languageChanger = (e: any) => {
    if (e.value.length < 0) return;
    if (e.value === 'korean') {
      setLanguage('korean');
    } else if (e.value === 'english') {
      setLanguage('english');
    }
  };

  const picker = (x: any, e: any) => {
    let flag = 0;
    for (let i = 0; i < x.list.length; i++) {
      if (language == 'korean') {
        if (x.list[i].nameKo == e.value.split(' ').slice(1).join(' ')) {
          x.func(x.list[i].url);
          flag++;
          break;
        }
      } else if (language == 'english') {
        if (x.list[i].name == e.value.split(' ').slice(1).join(' ')) {
          x.func(x.list[i].url);
          flag++;
          break;
        }
      }
    }
    if (flag == 0) x.func(db[0].url);
  };

  const eachTypeSelector = (x: any) => {
    let option = [];
    for (let i = 0; i < types.length; i++) {
      if (types[i].type == x.type) {
        for (let j = 0; j < types[i].list.length; j++) {
          option.push({
            value: `${types[i].list[j].code} ${
              language == 'korean'
                ? types[i].list[j].nameKo
                : types[i].list[j].name
            }`,
            label: (
              <div>
                {types[i].list[j].code}{' '}
                {language == 'korean'
                  ? types[i].list[j].nameKo
                  : types[i].list[j].name}
                <img style={{ width: '30px' }} src={x.list[j].url}></img>
              </div>
            ),
          });
        }
        option.unshift({
          value:
            language == 'korean'
              ? types[i].type
              : types[i].engType[0].toUpperCase() + types[i].engType.slice(1),
          label:
            language == 'korean'
              ? types[i].type
              : types[i].engType[0].toUpperCase() + types[i].engType.slice(1),
        });
        break;
      }
    }
    return option;
  };

  //아닐수도
  const iconSelector = (type: any) => {
    for (let i = 0; i < typeIcons.length; i++) {
      if (typeIcons[i].default.src.includes(type)) {
        return typeIcons[i].default.src;
      }
    }
  };

  const goUp = () => {
    if (topRef.current) {
      (topRef.current as any).scrollIntoView();
    }
  };

  const themeChanger = (color: any) => {
    setThemeColor(color.color);
    setThemeTitleColor(color.titleColor);
    setThemeBorderColor(color.borderColor);
    setThemeDesc(color.desc);
  };

  useEffect(() => {
    const checkCssLoaded = () => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => setIsCssLoaded(true));
      } else {
        setIsCssLoaded(true);
      }
    };

    checkCssLoaded();
  }, []);

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
    <div className="main-page">
      <$DownloadImage
        ref={TestRef}
        bgColor={themeColor}
        bgTitleColor={themeTitleColor}
        bgBorderColor={themeBorderColor}
      >
        <div
          style={{
            height: '20px',
            width: '100%',
            backgroundColor: pokeTheme.includes(themeDesc) ? 'red' : themeColor,
          }}
        ></div>
        <$TitleLine
          style={{
            backgroundColor: pokeTheme.includes(themeDesc) ? 'red' : themeColor,
          }}
        >
          PK-DIAGRAM
        </$TitleLine>
        <div
          style={{
            width: '100%',
            height: '10px',
            backgroundColor: pokeTheme.includes(themeDesc)
              ? 'black'
              : themeColor,
          }}
        ></div>
        <$CardWrapper>
          {types.map((x) => {
            return (
              <$Card3 style={{ backgroundColor: x.color }}>
                <div style={{ width: '100%', height: '8px' }}></div>
                <$TypeFont>
                  <$RealTypeIconWrapper
                    src={iconSelector(x.engType)}
                  ></$RealTypeIconWrapper>
                  <$RealTypeWrapper>
                    {language == 'korean'
                      ? x.type
                      : x.engType[0].toUpperCase() + x.engType.slice(1)}
                  </$RealTypeWrapper>
                </$TypeFont>
                <$ImgWrapper>
                  <$Img src={x.cur}></$Img>
                </$ImgWrapper>
              </$Card3>
            );
          })}
        </$CardWrapper>
      </$DownloadImage>
      {/* <$SelectWrapper ref={topRef}>
        <Select
          options={option}
          onChange={languageChanger}
          placeholder={<FaLanguage style={{ fontSize: '30px' }} />}
        ></Select>
      </$SelectWrapper> */}
      <br></br>
      <$Container>
        {types.map((x) => {
          let option = eachTypeSelector(x);
          return (
            <$Card style={{ backgroundColor: x.color }} sizing={language}>
              <$TypeWrapper id="type" sizing={language}>
                {language == 'korean'
                  ? x.type + ' 타입'
                  : x.engType[0].toUpperCase() + x.engType.slice(1) + ' Type'}
              </$TypeWrapper>
              <$customSelect
                options={option}
                onChange={(e) => {
                  picker(x, e);
                }}
                value={''}
                placeholder={language == 'korean' ? '검색' : 'Search'}
              ></$customSelect>
              <img style={{ margin: '10px', width: '80%' }} src={x.cur}></img>
            </$Card>
          );
        })}
      </$Container>
      <br></br>
      <$PreviewImage
        bgColor={themeColor}
        bgTitleColor={themeTitleColor}
        bgBorderColor={themeBorderColor}
      >
        <div
          style={{
            height: '20px',
            width: '100%',
            backgroundColor: pokeTheme.includes(themeDesc) ? 'red' : themeColor,
          }}
        ></div>
        <$TitleLine2
          style={{
            backgroundColor: pokeTheme.includes(themeDesc) ? 'red' : themeColor,
          }}
        >
          PK-DIAGRAM
        </$TitleLine2>
        <div
          style={{
            width: '100%',
            height: '10px',
            backgroundColor: pokeTheme.includes(themeDesc)
              ? 'black'
              : themeColor,
          }}
        ></div>
        <$CardWrapper2>
          {types.map((x) => {
            return (
              <$Card2 style={{ backgroundColor: x.color }}>
                <$TypeFont2>
                  <$PvTypeIconWrapper
                    src={iconSelector(x.engType)}
                  ></$PvTypeIconWrapper>
                  <$PvTypeWrapper>
                    {language == 'korean'
                      ? x.type
                      : x.engType[0].toUpperCase() + x.engType.slice(1)}
                  </$PvTypeWrapper>
                </$TypeFont2>
                <$ImgWrapper>
                  <$PvImg src={x.cur}></$PvImg>
                </$ImgWrapper>
              </$Card2>
            );
          })}
        </$CardWrapper2>
      </$PreviewImage>
      <br></br>
      <$Themes>
        {backgroundColors.map((color) => {
          return (
            <$EachColor
              id="each"
              onClick={() => {
                themeChanger(color);
              }}
            >
              <$ColorPreview
                theme={color.desc}
                judge={borderExsist}
                border={color.borderColor}
                style={{
                  backgroundColor: pokeTheme.includes(color.desc)
                    ? 'red'
                    : color.color,
                }}
              ></$ColorPreview>
              <h4 style={{ margin: 0 }}>{color.desc}</h4>
            </$EachColor>
          );
        })}
      </$Themes>
      <br></br>
      <$GenerateButton ref={buttonRef} onClick={exportElementAsPNG}>
        DOWNLOAD
      </$GenerateButton>
      <br></br>
      <br></br>
      <br></br>
      <$GoUp onClick={goUp}>
        <MdVerticalAlignTop />
      </$GoUp>
    </div>
  );
}

const $MailLink = styled.a`
  margin: 0;
  color: #ccc;
  text-decoration: none;
`;

const $Footer = styled.div`
  width: 90%;
  display: flex;
`;

const $FooterLine = styled.div`
  width: 95%;
  height: 2px;
  background-color: #ccc;
`;

const $PvTypeIconWrapper = styled.img`
  margin-left: 8px;
  width: 10%;
`;

const $PvTypeWrapper = styled.div`
  margin-right: 8px;
  font-size: 2vw;
  color: black;
`;

const $RealTypeWrapper = styled.div`
  margin-right: 8px;
  font-size: 18px;
  white-space: normal;
  color: black;
`;

const $RealTypeIconWrapper = styled.img`
  margin-left: 8px;
  width: 20px;
`;

const $ImgWrapper = styled.div`
  height: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const $PvImg = styled.img`
  width: 80%;
  margin-top: 10px;
`;

const $Img = styled.img`
  width: 128px;
  height: 128px;
`;

const $SelectWrapper = styled.div`
  width: 90%;
  display: flex;
  justify-content: end;
`;

const $ColorPreview = styled.div<any>`
  width: 15px;
  height: 15px;
  box-sizing: border-box;
  border-width: ${(props: any) =>
    props.judge.includes(props.theme) ? '2px' : '0.5px'};
  border-style: solid;
  border-color: ${(props: any) =>
    props.judge.includes(props.theme) ? props.border : 'black'};
  margin-right: 5px;
`;

const $EachColor = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px;
  cursor: pointer;
`;

const $Themes = styled.div`
  display: flex;
  width: 90%;
  justify-content: end;
  flex-wrap: wrap;
  @media (max-width: 400px) {
    flex-wrap: nowrap;
    flex-direction: column;
    align-items: start;
    & #each {
      height: 20px;
    }
  }
`;

const $GoUp = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: black;
  opacity: 30%;
  color: white;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  right: 3%;
  bottom: 3%;
  font-size: 30px;
  @media (max-width: 280px) {
    right: 10%;
  }
`;

const $TypeFont = styled.div`
  margin: 0;
  background-color: white;
  font-family: 'wehaven-regular';
  /* font-size: 20px; */
  display: flex;
  justify-content: space-between;
  height: 25px;
`;

const $TypeFont2 = styled.div`
  margin: 0;
  background-color: white;
  font-family: 'wehaven-regular';
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
`;

const $TitleLine2 = styled.div`
  display: flex;
  justify-content: center;
  font-family: 'monoton';
  box-sizing: border-box;
  font-size: 30px;
  height: auto;
  width: 100%;
`;

const $TitleLine = styled.div`
  display: flex;
  justify-content: center;
  font-family: 'monoton';
  font-size: 45px;
  box-sizing: border-box;
`;

const $DownloadImage = styled.div<any>`
  background-color: ${(props: any) => props.bgColor};
  color: ${(props: any) => props.bgTitleColor};
  border: 15px solid ${(props: any) => props.bgBorderColor};
  border-radius: 10px;
  display: none;
`;

const $PreviewImage = styled.div<any>`
  background-color: ${(props: any) => props.bgColor};
  color: ${(props: any) => props.bgTitleColor};
  border-radius: 10px;
  border: 15px solid ${(props: any) => props.bgBorderColor};
  width: 90vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const $CardWrapper = styled.div`
  width: 1050px;
  display: flex;
  padding: 10px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 15px;
`;

const $CardWrapper2 = styled.div`
  width: 100%;
  display: flex;
  padding: 10px;
  flex-wrap: wrap;
  justify-content: center;
`;

const $Container = styled.div`
  font-family: 'wehaven-regular';
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const $Card = styled.div<any>`
  width: 14%;
  border-radius: 5px;
  margin: 1%;
  @media (min-width: 500px) and (max-width: 780px) {
    width: 35%;
    & #type {
      font-size: ${(props: any) => (props.sizing == 'korean' ? '5vw' : '3vw')};
    }
  }
  @media (max-width: 500px) {
    width: 70%;
    & #type {
      font-size: ${(props: any) => (props.sizing == 'korean' ? '5vw' : '3vw')};
    }
  }
`;

const $Card2 = styled.div`
  width: 14%;
  border-radius: 5px;
  margin: 1%;
  padding-bottom: 15px;
`;

const $Card3 = styled.div`
  width: 150px;
  height: 220px;
  border-radius: 5px;
  margin: 5px 5px 5px 5px;
`;

const $TypeWrapper = styled.div<any>`
  display: flex;
  justify-content: center;
  padding: 10px;
  font-size: ${(props: any) => (props.sizing == 'korean' ? '2vw' : '1.5vw')};
`;

const $customSelect = styled(Select)`
  margin: 10px;
  color: black;
`;

const $GenerateButton = styled.button`
  border-radius: 5px;
  border-style: none;
  font-family: 'monoton';
  background-color: black;
  color: white;
  width: 90vw;
  font-size: 40px;
  animation: none;
  cursor: pointer;
  @keyframes jelly {
    25% {
      transform: scale(0.9, 1.1);
    }
    50% {
      transform: scale(1.1, 0.9);
    }
    75% {
      transform: scale(0.95, 1.05);
    }
  }
`;
