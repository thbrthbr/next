import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GlobalStore {
  sidebar: boolean;
  setSidebar: (text: any) => void;
  chat: string;
  setChat: (text: any) => void;
  chatList: any;
  setChatList: (object: any) => void;
  newMessage: any;
  setNewMessage: (text: any) => void;
}

interface LoginStore {
  loggedin: boolean;
  setLoggedin: (text: any) => void;
}

// interface Store {
//   loggedin: boolean;
//   setLoggedin: (text: any) => void;
// }

const GlobalStore = create<GlobalStore>((set) => ({
  sidebar: true,
  setSidebar: (input: boolean) => set({ sidebar: input }),
  chat: '',
  setChat: (input: string) => set({ chat: input }),
  chatList: [],
  setChatList: (input: any) => set({ chatList: input }),
  // setChatList: (input: string) =>
  //   set((state) => ({ chatList: [...state.chatList, input] })),
  newMessage: '',
  setNewMessage: (input: string) => set({ newMessage: input }),
}));

const LoginStore = create<any>(
  persist(
    (set) => ({
      loggedin: false,
      setLoggedin: (input: boolean) => set({ loggedin: input }),
      sessionId: '',
      setSessionId: (input: string) => set({ sessionId: input }),
      sessionNick: '',
      setSessionNick: (input: string) => set({ sessionNick: input }),
      sessionImage: '',
      setSessionImage: (input: string) => set({ sessionImage: input }),
    }),
    {
      name: 'snsLogState',
      getStorage: () => sessionStorage,
    },
  ),
);

// export const useBearStore = create(
//     persist(
//       (set, get) => ({
//         bears: 0,
//         addABear: () => set({ bears: get().bears + 1 }),
//       }),
//       {
//         name: 'food-storage', // name of the item in the storage (must be unique)
//         storage: createJSONStorage(() => sessionStorage), // (optional)이기 때문에 해당 줄을 적지 않으면 'localStorage'가 기본 저장소로 사용된다.
//       },
//     ),
//   )

export { GlobalStore, LoginStore };
