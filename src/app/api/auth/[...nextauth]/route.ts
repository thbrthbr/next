import {
  addOrNotMember,
  getMoreSeveralData,
  replaceToInSiteMember,
} from '@/data/firebase';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'PK-Place',
      credentials: {
        username: {
          label: '이메일',
          type: 'text',
          placeholder: '이메일 주소 입력 요망',
        },
        password: { label: '비밀번호', type: 'password' },
      },

      async authorize(credentials, req) {
        const res = await fetch(`http://localhost:3000/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials?.username,
            pw: credentials?.password,
          }),
        });
        const user = await res.json();
        const packet = {
          name: user.data.nick,
          email: user.data.email,
          image: user.data.profileImg,
          pw: user.data.pw,
          point: user.data.point,
        };
        user.data = { ...user.data, ...packet };
        if (user.data.email) {
          return user.data;
        } else {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    KakaoProvider({
      clientId: process.env.AUTH_KAKAO_CLIENT_ID!,
      clientSecret: process.env.AUTH_KAKAO_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session !== null) {
        const { image, name } = session;
        if (name.length > 1) {
          token.name = name;
        }
        if (image.length > 1) {
          token.image = image;
          token.picture = image;
        }
      }

      return { ...token, ...user };
    },

    async session({ session, token }) {
      let email = token.email;
      let plus = await getMoreSeveralData({ email });
      token.point = plus?.point;
      token.role = plus?.role;
      token.image = token.picture;
      session.user = token as any;
      return session;
    },

    async signIn({ user, profile }) {
      try {
        const makeCode = (length: number) => {
          let result = '';
          const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
          const charactersLength = characters.length;
          let counter = 0;
          while (counter < length) {
            result += characters.charAt(
              Math.floor(Math.random() * charactersLength),
            );
            counter += 1;
          }
          return result;
        };
        let email = user.email;
        let password = user.id + makeCode(8);
        let name = user.name;
        let image = user.image;
        let state = await addOrNotMember({ email, password, name, image });
        if (state?.status == '중복') {
          let replaced = await replaceToInSiteMember({ email });
          user.name = replaced.name;
          user.image = replaced.image;
          return true;
        } else {
          return true;
        }
      } catch (e) {
        return false;
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
});

export { handler as GET, handler as POST };
