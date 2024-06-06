import {defineStore} from "pinia";

export type UserType = {
    _id: 0,
    username: "",
    email: "",
    password: "",
    color: "",
    createdAt: "",
    updatedAt: "",
};
export const userStore = defineStore("user", {
    state: (): { user: any; token: string } => ({
        user: JSON.parse(localStorage.getItem("user") || "{}"),
        token: localStorage.getItem("token") || "",
    }),
    actions: {
        setUser(user: UserType) {
            this.user = user;
            localStorage.setItem("user", JSON.stringify(user));
        },
        setToken(token: string) {
            this.token = token;
            localStorage.setItem("token", token);
        },
    },
    getters: {
        getUser(): UserType {
            return this.user;
        },
        getToken(): string {
            return this.token;
        }
    }
});

