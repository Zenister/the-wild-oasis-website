import { createGuest, getGuest } from "@/app/_lib/data-service";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const authConfig = {
  providers: [Google],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      // check if current user try to access /login
      if (auth?.user && pathname.startsWith("/login")) {
        return Response.redirect(new URL("/", request.nextUrl));
      }
      // !! is to convert the statement into boolean
      return !!auth?.user;
    },
    async signIn({ user, account, profile }) {
      try {
        // check if the user exist
        const existingGuest = await getGuest(user.email);

        // if there's no user exist yet then create
        if (!existingGuest)
          await createGuest({ email: user.email, fullName: user.name });

        return true;
      } catch {
        return false;
      }
    },
    async session({ session, user }) {
      const guest = await getGuest(session.user.email);
      // mutate the session to add the guestId
      session.user.guestId = guest.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
