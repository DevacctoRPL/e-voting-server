import { User } from "@prisma/client"

export type UpdateSuaraReq = User & { No_Pilihan: number }

export type LoginUserReq = {
  NIU: string,
  password: number,
}

export type DataLiveRes = {
  OSIS: {
    Pemilih_1: number,
    Pemilih_2: number,
    Pemilih_3: number,
    Jumlah_Vote: number,
  },
  MPK: {
    Pemilih_1: number,
    Pemilih_2: number,
    Pemilih_3: number,
    Jumlah_Vote: number,
  },
  Jumlah_User: Jumlah_User
}
