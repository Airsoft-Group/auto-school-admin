import { defineStore } from "pinia";

// import request from "../utils/request";

export const useFileStore = defineStore("file", {
    actions: {
        async uploadFile(file: File) {
            const formData = new FormData();
            formData.append("file", file, file.name);

            // return request.post("/file/upload", formData);
        },

        async downloadById(file_id: string) {
            // return request.post("/file/download", { file_id }, {
            //     responseType: "blob",
            // } as any) as any;
        },
    },
});