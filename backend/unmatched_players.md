# Players without a FotMob photo

427 Understat players that `10_fetch_player_profiles.py` couldn't match to FotMob, so the app shows their initials. Most are fringe players from 2014/15-2015/16 (before FotMob's season stat lists) or have a different spelling on FotMob.

To fix one, find their FotMob id (search fotmob.com; the id is in the player page URL), add `understat_id: fotmob_id` to `FOTMOB_IDS` in `10_fetch_player_profiles.py` and re-run it. The Transfermarkt name is often closer to FotMob's spelling.

Sorted by total minutes, most first.

| Understat id | Name | Transfermarkt name | Seasons | Minutes |
| --- | --- | --- | --- | --- |
| 2378 | Daniel Parejo |  | PD 2014/15, PD 2015/16, PD 2016/17, PD 2017/18, PD 2018/19, PD 2019/20, PD 2020/21, PD 2021/22, PD 2022/23, PD 2023/24, PD 2024/25, PD 2025/26 | 33489 |
| 6434 | Franck Zambo |  | FL1 2015/16, FL1 2016/17, FL1 2017/18, PL 2018/19, PD 2019/20, PL 2020/21, SA 2021/22, SA 2022/23, SA 2023/24, SA 2024/25, SA 2025/26 | 23234 |
| 1927 | Berat Gjimshiti |  | SA 2015/16, SA 2017/18, SA 2018/19, SA 2019/20, SA 2020/21, SA 2021/22, SA 2022/23, SA 2023/24, SA 2024/25, SA 2025/26 | 22242 |
| 1354 | Gianmarco Ferrari |  | SA 2016/17, SA 2017/18, SA 2018/19, SA 2019/20, SA 2020/21, SA 2021/22, SA 2022/23, SA 2023/24 | 21260 |
| 7049 | Evan Ndicka |  | BL1 2018/19, BL1 2019/20, BL1 2020/21, BL1 2021/22, BL1 2022/23, SA 2023/24, SA 2024/25, SA 2025/26 | 19927 |
| 3785 | Kelvin Adou |  | FL1 2016/17, FL1 2017/18, FL1 2018/19, FL1 2019/20, SA 2021/22, SA 2022/23, FL1 2023/24, FL1 2024/25, FL1 2025/26 | 19400 |
| 1374 | José Reina |  | BL1 2014/15, SA 2015/16, SA 2016/17, SA 2017/18, SA 2018/19, PL 2019/20, SA 2019/20, SA 2020/21, SA 2021/22, PD 2022/23, PD 2023/24, SA 2024/25 | 18835 |
| 7382 | Dan Burn |  | PL 2019/20, PL 2020/21, PL 2021/22, PL 2022/23, PL 2023/24, PL 2024/25, PL 2025/26 | 18831 |
| 5243 | Dayotchanculle Upamecano |  | BL1 2016/17, BL1 2017/18, BL1 2018/19, BL1 2019/20, BL1 2020/21, BL1 2021/22, BL1 2022/23, BL1 2023/24, BL1 2024/25, BL1 2025/26 | 18806 |
| 1246 | Kostas Manolas |  | SA 2014/15, SA 2015/16, SA 2016/17, SA 2017/18, SA 2018/19, SA 2019/20, SA 2020/21, SA 2021/22, SA 2023/24 | 18478 |
| 6708 | Bote Baku |  | BL1 2017/18, BL1 2018/19, BL1 2019/20, BL1 2020/21, BL1 2021/22, BL1 2022/23, BL1 2023/24, BL1 2024/25, BL1 2025/26 | 18428 |
| 2385 | Mat Ryan |  | PD 2015/16, PD 2016/17, PL 2017/18, PL 2018/19, PL 2019/20, PL 2020/21, PD 2021/22, FL1 2024/25, PD 2025/26 | 16830 |
| 2413 | Steven N'Zonzi |  | PL 2014/15, PD 2015/16, PD 2016/17, PD 2017/18, SA 2018/19, FL1 2019/20, FL1 2020/21 | 16419 |
| 8864 | Matthew Cash |  | PL 2020/21, PL 2021/22, PL 2022/23, PL 2023/24, PL 2024/25, PL 2025/26 | 14864 |
| 6935 | Naif Aguerd |  | FL1 2018/19, FL1 2019/20, FL1 2020/21, FL1 2021/22, PL 2022/23, PL 2023/24, PD 2024/25, FL1 2025/26, PL 2025/26 | 14731 |
| 7070 | Santiago Comesaña |  | PD 2018/19, PD 2021/22, PD 2022/23, PD 2023/24, PD 2024/25, PD 2025/26 | 13924 |
| 8733 | Alfonso Espino |  | PD 2020/21, PD 2021/22, PD 2022/23, PD 2023/24, PD 2024/25, PD 2025/26 | 13919 |
| 7265 | Kephren Thuram |  | FL1 2019/20, FL1 2020/21, FL1 2021/22, FL1 2022/23, FL1 2023/24, SA 2024/25, SA 2025/26 | 13502 |
| 2112 | Papakouly Diop |  | PD 2014/15, PD 2015/16, PD 2016/17, PD 2017/18, PD 2018/19, PD 2019/20, PD 2020/21 | 13091 |
| 6766 | Dani Vivian |  | PD 2021/22, PD 2022/23, PD 2023/24, PD 2024/25, PD 2025/26 | 12384 |
| 10291 | Vitalii Mykolenko |  | PL 2021/22, PL 2022/23, PL 2023/24, PL 2024/25, PL 2025/26 | 12240 |
| 7937 | Julian Chabot |  | SA 2019/20, SA 2020/21, BL1 2021/22, SA 2021/22, BL1 2022/23, BL1 2023/24, BL1 2024/25, BL1 2025/26 | 12029 |
| 9674 | Joe Scally |  | BL1 2021/22, BL1 2022/23, BL1 2023/24, BL1 2024/25, BL1 2025/26 | 11569 |
| 8050 | Hichem Boudaoui |  | FL1 2019/20, FL1 2020/21, FL1 2021/22, FL1 2022/23, FL1 2023/24, FL1 2024/25, FL1 2025/26 | 11535 |
| 5978 | Dmitri Lienard |  | FL1 2017/18, FL1 2018/19, FL1 2019/20, FL1 2020/21, FL1 2021/22, FL1 2022/23 | 10811 |
| 6517 | Charalampos Lykogiannis |  | SA 2017/18, SA 2018/19, SA 2019/20, SA 2020/21, SA 2021/22, SA 2022/23, SA 2023/24, SA 2024/25, SA 2025/26 | 10782 |
| 2233 | Xabi Prieto |  | PD 2014/15, PD 2015/16, PD 2016/17, PD 2017/18 | 10137 |
| 1534 | Giancarlo Gonzalez | Giancarlo González | SA 2014/15, SA 2015/16, SA 2016/17, SA 2017/18, SA 2018/19 | 9899 |
| 6630 | Joe Willock |  | PL 2017/18, PL 2018/19, PL 2019/20, PL 2020/21, PL 2021/22, PL 2022/23, PL 2023/24, PL 2024/25, PL 2025/26 | 9320 |
| 11486 | Illia Zabarnyi |  | PL 2022/23, PL 2023/24, PL 2024/25, FL1 2025/26 | 9123 |
| 7106 | Philipp Mwene |  | BL1 2018/19, BL1 2019/20, BL1 2020/21, BL1 2023/24, BL1 2024/25, BL1 2025/26 | 9034 |
| 789 | Robbie Brady |  | PL 2014/15, PL 2015/16, PL 2016/17, PL 2017/18, PL 2018/19, PL 2019/20, PL 2020/21 | 8933 |
| 3546 | Julian Palmieri |  | FL1 2014/15, FL1 2015/16, FL1 2016/17, FL1 2017/18 | 8459 |
| 9805 | Álex Balde |  | PD 2021/22, PD 2022/23, PD 2023/24, PD 2024/25, PD 2025/26 | 8255 |
| 11322 | Viktor Tsygankov |  | PD 2022/23, PD 2023/24, PD 2024/25, PD 2025/26 | 8238 |
| 752 | Daniel Drinkwater |  | PL 2014/15, PL 2015/16, PL 2016/17, PL 2017/18, PL 2019/20 | 7837 |
| 1685 | Ahmed Elmohamady |  | PL 2014/15, PL 2016/17, PL 2019/20, PL 2020/21 | 7759 |
| 6592 | Manuel Morlanes |  | PD 2018/19, PD 2019/20, PD 2021/22, PD 2022/23, PD 2023/24, PD 2024/25, PD 2025/26 | 7616 |
| 5686 | Digbo Maiga |  | FL1 2016/17, FL1 2017/18, FL1 2019/20, FL1 2020/21, FL1 2021/22, FL1 2023/24 | 7387 |
| 3575 | Moustapha Diallo |  | FL1 2014/15, FL1 2015/16, FL1 2016/17, FL1 2017/18, FL1 2018/19 | 7323 |
| 11910 | William Pacho |  | BL1 2023/24, FL1 2024/25, FL1 2025/26 | 7007 |
| 8413 | Javier López |  | PD 2019/20, PD 2020/21, PD 2021/22, PD 2023/24, PD 2024/25, PD 2025/26 | 6916 |
| 1736 | Oliver McBurnie |  | PL 2016/17, PL 2017/18, PL 2019/20, PL 2020/21, PL 2023/24, PD 2024/25 | 6880 |
| 7387 | Dimitris Nikolaou |  | SA 2018/19, SA 2021/22, SA 2022/23 | 6559 |
| 9451 | Chimuanya Ugochukwu |  | FL1 2020/21, FL1 2021/22, FL1 2022/23, PL 2023/24, PL 2024/25, PL 2025/26 | 6170 |
| 8422 | Javi Hernández |  | PD 2022/23, PD 2023/24, PD 2024/25 | 6134 |
| 7905 | Fede San Emeterio |  | PD 2019/20, PD 2020/21, PD 2021/22, PD 2022/23, PD 2023/24 | 6118 |
| 6626 | Joshua Vagnoman |  | BL1 2017/18, BL1 2022/23, BL1 2023/24, BL1 2024/25, BL1 2025/26 | 6055 |
| 3682 | Jordan Siebatcheu | Jordan | FL1 2014/15, FL1 2015/16, FL1 2018/19, FL1 2019/20, BL1 2022/23, BL1 2023/24, BL1 2024/25, FL1 2024/25 | 5986 |
| 4896 | Andrew Gravillon |  | SA 2017/18, FL1 2020/21, FL1 2021/22, FL1 2022/23, SA 2022/23 | 5858 |
| 8328 | Azz-Eddine Ounahi |  | FL1 2021/22, FL1 2022/23, FL1 2023/24, PD 2025/26 | 5850 |
| 12893 | Enzo Boyomo |  | PD 2024/25, PD 2025/26 | 5798 |
| 9745 | Dimitris Giannoulis |  | PL 2021/22, BL1 2024/25, BL1 2025/26 | 5791 |
| 6482 | Eddie Nketiah |  | PL 2017/18, PL 2018/19, PL 2019/20, PL 2020/21, PL 2021/22, PL 2022/23, PL 2023/24, PL 2024/25, PL 2025/26 | 5335 |
| 2205 | Juan Rodríguez |  | PD 2014/15, PD 2015/16 | 5289 |
| 2318 | Fede Cartabia |  | PD 2014/15, PD 2015/16, PD 2016/17, PD 2017/18 | 5020 |
| 2062 | Nico Pareja |  | PD 2014/15, PD 2015/16, PD 2016/17, PD 2017/18 | 4981 |
| 7967 | Anssumane Fati |  | PD 2019/20, PD 2020/21, PD 2021/22, PD 2022/23, PD 2023/24, PL 2023/24, PD 2024/25, FL1 2025/26 | 4903 |
| 3418 | Ricardo Carvalho |  | FL1 2014/15, FL1 2015/16 | 4902 |
| 5140 | Kike Barja |  | PD 2016/17, PD 2019/20, PD 2020/21, PD 2021/22, PD 2022/23, PD 2023/24, PD 2024/25, PD 2025/26 | 4879 |
| 5113 | Santos Borré |  | PD 2016/17, BL1 2021/22, BL1 2022/23, BL1 2023/24 | 4764 |
| 11772 | Yehor Yarmolyuk |  | PL 2023/24, PL 2024/25, PL 2025/26 | 4714 |
| 9270 | Kiliann Sildillia |  | BL1 2021/22, BL1 2022/23, BL1 2023/24, BL1 2024/25 | 4705 |
| 8702 | Tinotenda Kadewere |  | FL1 2020/21, FL1 2021/22, PD 2022/23, FL1 2023/24, FL1 2024/25 | 4641 |
| 2343 | Juanpi |  | PD 2014/15, PD 2015/16, PD 2016/17, PD 2017/18, PD 2018/19 | 4570 |
| 1166 | Ahmed Benali |  | SA 2016/17, SA 2017/18, SA 2020/21 | 4551 |
| 5773 | Zaydou Youssef |  | FL1 2016/17, FL1 2017/18, FL1 2018/19, FL1 2019/20, FL1 2020/21, FL1 2021/22 | 4480 |
| 13062 | Mohammed Amoura |  | BL1 2024/25, BL1 2025/26 | 4461 |
| 2068 | Yevhen Konoplyanka |  | PD 2015/16, BL1 2016/17, BL1 2017/18, BL1 2018/19 | 4434 |
| 6487 | John Mendoza |  | FL1 2017/18, FL1 2018/19, FL1 2019/20 | 4035 |
| 7981 | Nianzou Kouassi |  | FL1 2019/20, BL1 2020/21, BL1 2021/22, PD 2022/23, PD 2023/24, PD 2024/25, PD 2025/26 | 4005 |
| 1729 | Georges-Kévin Nkoudou |  | FL1 2014/15, FL1 2015/16, PL 2016/17, PL 2017/18, FL1 2018/19, PL 2018/19, PL 2019/20 | 3956 |
| 8108 | Daniel Cárdenas |  | PD 2020/21, PD 2021/22, PD 2023/24, PD 2024/25, PD 2025/26 | 3870 |
| 3242 | Diego | Diego Rigonato | FL1 2014/15, FL1 2015/16 | 3823 |
| 12168 | Alejandro Jiménez |  | SA 2023/24, SA 2024/25, PL 2025/26, SA 2025/26 | 3745 |
| 6595 | Paul Jäckel |  | BL1 2017/18, BL1 2021/22, BL1 2022/23, BL1 2023/24 | 3734 |
| 11763 | Abduqodir Khusanov |  | FL1 2023/24, FL1 2024/25, PL 2024/25, PL 2025/26 | 3724 |
| 8933 | Marcos de Sousa |  | PD 2020/21, PD 2021/22, PD 2022/23, PD 2024/25 | 3721 |
| 6400 | Antonio Martínez |  | PD 2024/25, PD 2025/26 | 3715 |
| 6557 | Louis Beyer |  | BL1 2018/19, BL1 2019/20, BL1 2020/21, BL1 2021/22, PL 2023/24 | 3643 |
| 10497 | Yannick Engelhardt |  | SA 2024/25, BL1 2025/26 | 3640 |
| 1851 | Juanito Gómez |  | SA 2014/15, SA 2015/16 | 3628 |
| 2029 | Maximiliano Moralez |  | SA 2014/15, SA 2015/16 | 3624 |
| 375 | Odisseas Vlachodimos |  | BL1 2015/16, PL 2023/24, PD 2025/26 | 3620 |
| 3557 | Lass Diarra |  | FL1 2015/16, FL1 2016/17, FL1 2017/18, FL1 2018/19 | 3590 |
| 6920 | Chris Ramos |  | PD 2018/19, PD 2022/23, PD 2023/24 | 3521 |
| 1815 | Alex |  | SA 2014/15, SA 2015/16 | 3487 |
| 2177 | David Navarro |  | PD 2014/15, PD 2015/16 | 3483 |
| 11294 | Lilian Raolisoa |  | FL1 2022/23, FL1 2024/25, FL1 2025/26 | 3434 |
| 10399 | Juan Latasa |  | PD 2021/22, PD 2022/23, PD 2023/24, PD 2024/25 | 3344 |
| 284 | Carlos Zambrano |  | BL1 2014/15, BL1 2015/16 | 3243 |
| 10844 | Darline Yongwa |  | FL1 2022/23, FL1 2023/24, FL1 2025/26 | 3191 |
| 4390 | Robert Green |  | PL 2014/15 | 3183 |
| 2034 | Rafael Márquez | Rafael | SA 2014/15, SA 2015/16 | 2980 |
| 2178 | Juanfran |  | PD 2014/15, PD 2015/16 | 2952 |
| 5076 | Cristian Rivera |  | PD 2016/17, PD 2017/18, PD 2018/19, PD 2019/20 | 2944 |
| 7024 | Kasim Nuhu |  | BL1 2018/19, BL1 2019/20, BL1 2020/21, BL1 2021/22, BL1 2023/24 | 2904 |
| 11297 | Carlos Alcaraz |  | PL 2022/23, SA 2023/24, PL 2024/25, PL 2025/26 | 2862 |
| 77 | Jin-Su Kim | Jin-su Kim | BL1 2014/15, BL1 2015/16 | 2816 |
| 61 | Geoffroy Serey Dié |  | BL1 2014/15, BL1 2015/16 | 2815 |
| 8914 | Salvador Ferrer |  | SA 2020/21, SA 2021/22, SA 2022/23 | 2793 |
| 7845 | Aleksander Sedlar |  | PD 2019/20, PD 2021/22, PD 2023/24, PD 2024/25 | 2763 |
| 10830 | Jean Négoce |  | FL1 2022/23, BL1 2023/24, BL1 2024/25, BL1 2025/26 | 2659 |
| 123 | Assani Lukimya |  | BL1 2014/15, BL1 2015/16 | 2658 |
| 959 | Joe Bennett |  | PL 2018/19 | 2648 |
| 8776 | Wes Foderingham |  | PL 2023/24 | 2644 |
| 3245 | David Ngog |  | FL1 2014/15, FL1 2015/16 | 2603 |
| 401 | Álvaro Domínguez |  | BL1 2014/15, BL1 2015/16 | 2585 |
| 2601 | Toño |  | PD 2014/15, PD 2015/16 | 2546 |
| 11825 | Abderrahmane Rebbach |  | PD 2023/24, PD 2024/25, PD 2025/26 | 2541 |
| 8686 | Cheick Tidiane Sabaly |  | FL1 2020/21, FL1 2021/22, FL1 2023/24, FL1 2025/26 | 2536 |
| 2448 | Juan Vargas | Juan Manuel Vargas | SA 2014/15, PD 2015/16 | 2529 |
| 2474 | Aderlan Santos |  | PD 2015/16, PD 2016/17 | 2520 |
| 2171 | Manucho |  | PD 2014/15, PD 2015/16 | 2510 |
| 8461 | Nicolás Melamed |  | PD 2019/20, PD 2021/22, PD 2022/23 | 2490 |
| 9447 | Niakhate Ndiaye |  | FL1 2024/25, SA 2025/26 | 2489 |
| 11834 | Adrià Alti |  | PD 2023/24, PD 2024/25, PD 2025/26 | 2444 |
| 2431 | Abraham | Abraham González | PD 2014/15, PD 2015/16 | 2385 |
| 11305 | Mykhailo Mudryk |  | PL 2022/23, PL 2023/24, PL 2024/25 | 2350 |
| 7557 | Yassin Benrahou |  | FL1 2018/19, FL1 2019/20, FL1 2020/21 | 2348 |
| 15 | Júnior Díaz |  | BL1 2014/15, BL1 2015/16 | 2304 |
| 4904 | Adrián Cubas |  | SA 2016/17, FL1 2020/21 | 2277 |
| 2139 | Ion Ansotegi |  | PD 2014/15, PD 2015/16 | 2252 |
| 10485 | Guemissongui Ouattara |  | FL1 2024/25, FL1 2025/26 | 2205 |
| 7492 | Xavier Quintillá |  | PD 2018/19, PD 2019/20 | 2200 |
| 6538 | Oghenekaro Etebo |  | PD 2017/18, PD 2019/20, PL 2021/22 | 2181 |
| 2558 | Lass | Lass Bangoura | PD 2014/15, FL1 2015/16, PD 2015/16 | 2169 |
| 13715 | Dan Ballard |  | PL 2025/26 | 2143 |
| 12069 | Junior Adamu |  | BL1 2023/24, BL1 2024/25, BL1 2025/26 | 2098 |
| 3249 | Mohamed Fofana |  | FL1 2014/15, FL1 2015/16 | 2077 |
| 9317 | Oussama Targhaline |  | FL1 2021/22, FL1 2023/24, FL1 2024/25 | 2052 |
| 3870 | Nemanja Vidic | Nemanja Vidic‎ | SA 2014/15 | 2050 |
| 3368 | Junior Tallo |  | FL1 2014/15, FL1 2015/16 | 2048 |
| 13200 | Fernando López |  | PD 2024/25, PD 2025/26, PL 2025/26 | 2044 |
| 4045 | Corona | Miguel Ángel Corona | PD 2014/15 | 2029 |
| 11142 | Pierre Ganiou |  | FL1 2025/26 | 2018 |
| 1824 | Maicon |  | SA 2014/15, SA 2015/16 | 1998 |
| 4047 | Wellington | Wellington Silva | PD 2014/15 | 1995 |
| 2076 | Miguel Lopes |  | PD 2015/16 | 1977 |
| 13061 | Benjamín Domínguez |  | SA 2024/25, SA 2025/26 | 1862 |
| 13206 | Matt O'Riley |  | PL 2024/25, FL1 2025/26, PL 2025/26 | 1854 |
| 11826 | Carlos Benavídez |  | PD 2023/24, PD 2024/25, PD 2025/26 | 1851 |
| 4072 | Deivid |  | PD 2014/15 | 1808 |
| 4071 | Íñigo López | Iñigo López | PD 2014/15 | 1792 |
| 9704 | Vasilios Lampropoulos |  | BL1 2021/22, BL1 2022/23 | 1788 |
| 4093 | Xavi |  | PD 2014/15 | 1778 |
| 796 | Gary O'Neil |  | PL 2015/16 | 1738 |
| 8690 | Jean-Phillipe Krasso |  | FL1 2020/21, FL1 2021/22, FL1 2025/26 | 1734 |
| 3559 | Abdel Barrada |  | FL1 2014/15, FL1 2015/16 | 1731 |
| 1907 | Jerry Mbakogu |  | SA 2015/16 | 1706 |
| 4272 | Anderson | Bamba Anderson | BL1 2014/15 | 1687 |
| 4135 | Javi Lara |  | PD 2014/15 | 1685 |
| 2003 | Antonio La Gumina |  | SA 2014/15, SA 2015/16, SA 2018/19, SA 2019/20, SA 2020/21 | 1673 |
| 10405 | Josh Dasilva |  | PL 2021/22, PL 2022/23, PL 2023/24, PL 2025/26 | 1634 |
| 11747 | Juan Herzog |  | PD 2023/24, PD 2024/25 | 1611 |
| 6201 | Andrej Galabinov |  | SA 2017/18, SA 2020/21 | 1544 |
| 7737 | Efthymios Koulouris |  | FL1 2019/20 | 1544 |
| 4016 | Edimar |  | PD 2014/15, SA 2014/15 | 1508 |
| 3937 | Daniele Conti |  | SA 2014/15 | 1491 |
| 2146 | Xavi Torres |  | PD 2015/16, PD 2016/17 | 1483 |
| 4231 | Rafa | Rafa López | BL1 2014/15, PD 2014/15 | 1482 |
| 4724 | Romaric |  | FL1 2014/15 | 1459 |
| 4411 | Alex Bruce |  | PL 2014/15 | 1457 |
| 6355 | Kostas Mitroglou |  | FL1 2017/18, FL1 2018/19 | 1450 |
| 1885 | Tino Costa |  | SA 2014/15, SA 2015/16 | 1447 |
| 3407 | Adryan |  | FL1 2015/16 | 1447 |
| 4121 | Cristian Álvarez |  | PD 2014/15 | 1439 |
| 2546 | Juan Domínguez |  | PD 2014/15, PD 2015/16 | 1430 |
| 12643 | Javier Rueda |  | PD 2023/24, PD 2025/26 | 1419 |
| 50 | Gonzalo Jara |  | BL1 2014/15, BL1 2015/16 | 1417 |
| 1946 | Pepín | Pepín Machín | SA 2018/19, SA 2022/23, SA 2023/24 | 1417 |
| 8383 | Faustino Anjorin |  | PL 2019/20, SA 2024/25, SA 2025/26 | 1404 |
| 8151 | Hianga'a M'Bock |  | FL1 2019/20, FL1 2020/21, FL1 2021/22, FL1 2022/23, FL1 2023/24, FL1 2024/25 | 1404 |
| 2454 | Adriano |  | PD 2014/15, PD 2015/16 | 1380 |
| 2322 | Cani |  | PD 2014/15, PD 2015/16 | 1379 |
| 3392 | Lucas Silva |  | PD 2014/15, FL1 2015/16 | 1376 |
| 5640 | Sergei Chernik |  | FL1 2016/17 | 1371 |
| 4041 | Julián | Julián Cuesta | PD 2014/15 | 1350 |
| 10263 | Alaa Bellarouch |  | FL1 2023/24 | 1350 |
| 13278 | Youssef Lekhedim |  | PD 2025/26 | 1332 |
| 4806 | Sergei Krivets |  | FL1 2014/15 | 1324 |
| 12387 | Dehmaine Assoumani |  | FL1 2024/25, FL1 2025/26 | 1324 |
| 10925 | Michael Barreto | Michaël Barreto | FL1 2022/23 | 1320 |
| 5124 | Alberto Rodríguez |  | PD 2019/20, PD 2020/21, PD 2021/22 | 1319 |
| 4122 | Licá |  | PD 2014/15 | 1307 |
| 3897 | Rafael Marques |  | SA 2014/15 | 1258 |
| 2078 | Ricardo Costa |  | PD 2015/16 | 1251 |
| 13600 | Andrés Castrín |  | PD 2025/26 | 1251 |
| 4820 | Juan Manuel Falcón | Juan Falcón | FL1 2014/15 | 1250 |
| 4044 | Fran Vélez |  | PD 2014/15 | 1214 |
| 6037 | Danny Williams |  | PL 2017/18, PL 2018/19 | 1202 |
| 4112 | Coro |  | PD 2014/15 | 1201 |
| 5118 | Alberto |  | PD 2016/17 | 1192 |
| 10561 | Jesús Santiago |  | PD 2021/22, PD 2023/24, PD 2024/25, SA 2025/26 | 1154 |
| 2140 | Borja Ekiza |  | PD 2014/15, PD 2015/16 | 1124 |
| 2579 | Nicolás López |  | SA 2014/15, PD 2015/16 | 1122 |
| 3642 | Alexis Peuget |  | FL1 2014/15, FL1 2015/16 | 1102 |
| 1646 | David Ivan |  | SA 2015/16 | 1095 |
| 8306 | Sofian Chakla |  | PD 2019/20, PD 2020/21 | 1086 |
| 7977 | Evgen Shakhov |  | SA 2019/20 | 1074 |
| 11892 | Leart Paqarada |  | BL1 2023/24, BL1 2025/26 | 1070 |
| 3901 | Guillermo Rodríguez |  | SA 2014/15 | 1043 |
| 2550 | Nikos Karámpelas |  | PD 2014/15, PD 2015/16 | 1038 |
| 3932 | Ivan Martic |  | SA 2014/15 | 1031 |
| 9267 | Momo Mbaye |  | PD 2022/23, PD 2023/24 | 1028 |
| 3499 | Gael Angoula | Gaël Angoula | FL1 2015/16 | 1009 |
| 4081 | Javier Espinosa |  | PD 2014/15 | 1006 |
| 3822 | Luis Pedro Cavanda |  | SA 2014/15 | 995 |
| 932 | Danny Graham |  | PL 2014/15, PL 2015/16 | 972 |
| 381 | Ronny |  | BL1 2014/15, BL1 2015/16 | 960 |
| 4495 | Liam Moore |  | PL 2014/15 | 934 |
| 4404 | Ryan Taylor |  | PL 2014/15 | 909 |
| 3871 | Lukas Podolski |  | PL 2014/15, SA 2014/15 | 906 |
| 12258 | Luc Zogbe |  | FL1 2023/24, FL1 2024/25, FL1 2025/26 | 904 |
| 10797 | Kévin Biakolo |  | FL1 2022/23, FL1 2023/24 | 888 |
| 14432 | Ali Youssif |  | FL1 2025/26 | 875 |
| 4711 | Jesper Juelsgaard |  | FL1 2014/15 | 873 |
| 8768 | Kevin Omoruyi |  | FL1 2025/26 | 864 |
| 8769 | Dani Escriche |  | PD 2020/21 | 850 |
| 9496 | Alejandro Cantero |  | PD 2020/21, PD 2021/22 | 822 |
| 2030 | Henrique |  | SA 2014/15 | 816 |
| 3914 | Alejandro González |  | SA 2014/15 | 800 |
| 13787 | Manuel Fernández |  | PD 2025/26 | 768 |
| 578 | Juan Carlos Paredes |  | PL 2015/16 | 758 |
| 2450 | Wanderson |  | PD 2015/16 | 754 |
| 2222 | Pablo Pérez |  | PD 2015/16 | 751 |
| 4079 | Patrick Ekeng |  | PD 2014/15 | 749 |
| 12001 | Joseph N'Duquidi |  | FL1 2023/24, FL1 2025/26 | 748 |
| 9825 | Nicolás Serrano |  | PD 2021/22, PD 2024/25, PD 2025/26 | 737 |
| 3681 | Rincon | Rincón | FL1 2015/16 | 716 |
| 4704 | Ismael Bangoura | Ismaël Bangoura | FL1 2014/15 | 700 |
| 3452 | Pape Paye |  | FL1 2015/16 | 682 |
| 4750 | Pedrinho |  | FL1 2014/15 | 668 |
| 1985 | Marcelo Estigarribia |  | SA 2014/15, SA 2015/16 | 653 |
| 1103 | Nicola Ninkovic |  | SA 2015/16, SA 2016/17 | 644 |
| 3823 | Cristian Ledesma |  | SA 2014/15 | 638 |
| 3860 | Zé Eduardo |  | SA 2014/15 | 633 |
| 9170 | John Finn |  | PD 2020/21, FL1 2024/25, PD 2024/25 | 615 |
| 3869 | Dejan Lazarevic |  | SA 2014/15 | 612 |
| 2156 | Dani Giménez |  | PD 2015/16, PD 2016/17, PD 2017/18 | 605 |
| 4253 | Nikolce Noveski |  | BL1 2014/15 | 595 |
| 4464 | Matthew Taylor |  | PL 2014/15 | 576 |
| 4789 | El-Hadji Ba |  | FL1 2014/15 | 575 |
| 2327 | Jonathan Rodríguez |  | PD 2015/16 | 565 |
| 4148 | Babá | Baba | PD 2014/15 | 564 |
| 4159 | Guillermo | Guillermo Fernández | PD 2014/15 | 552 |
| 13159 | Marius Louãr |  | FL1 2025/26 | 535 |
| 918 | Joey O'Brien |  | PL 2014/15 | 523 |
| 3970 | Cristian Rodríguez |  | PD 2014/15, SA 2014/15 | 508 |
| 8208 | Mihai-Alexandru Dobre | Alexandru Dobre | FL1 2020/21 | 503 |
| 12809 | Ben Old |  | FL1 2024/25 | 503 |
| 3500 | Charles Diers |  | FL1 2015/16 | 472 |
| 10005 | Joshua Wilson-Esbrand |  | FL1 2023/24 | 460 |
| 661 | Josh Onomah |  | PL 2015/16, PL 2016/17, PL 2020/21, PL 2022/23 | 459 |
| 1967 | Gilberto |  | SA 2015/16 | 453 |
| 4140 | Jaime | Jaime Jiménez | PD 2014/15 | 450 |
| 1975 | Marquinho |  | SA 2015/16 | 436 |
| 4286 | Adam Matuschyk |  | BL1 2014/15 | 431 |
| 6347 | Shaquell Moore |  | PD 2017/18 | 425 |
| 4127 | Álex Pozuelo |  | PD 2014/15 | 421 |
| 4777 | Abdoul Ba |  | FL1 2014/15 | 421 |
| 4049 | Casado | José Manuel Casado | PD 2014/15 | 412 |
| 4325 | João Pereira |  | BL1 2014/15 | 403 |
| 11875 | Steven Shpendi |  | SA 2023/24 | 401 |
| 8876 | Dimitris Limnios |  | BL1 2020/21, BL1 2022/23 | 397 |
| 4362 | Junior Malanda |  | BL1 2014/15 | 394 |
| 4173 | López Garai | Aritz López Garai | PD 2014/15 | 386 |
| 13294 | García Pascual | Álvaro García Pascual | PD 2024/25 | 372 |
| 9918 | Alex Petxarromán |  | PD 2021/22 | 369 |
| 4102 | Juan Carlos |  | PD 2014/15 | 365 |
| 4083 | Jona |  | PD 2014/15 | 360 |
| 4825 | Boubacar Sylla |  | FL1 2014/15 | 346 |
| 9111 | Isma Ruiz |  | PD 2020/21, PD 2021/22 | 346 |
| 992 | James Wilson |  | PL 2014/15, PL 2015/16 | 335 |
| 14396 | Alexander Freeman |  | PD 2025/26 | 332 |
| 1858 | Massimo Zappino |  | SA 2015/16 | 331 |
| 2067 | Juan Muñoz |  | PD 2014/15, PD 2015/16 | 330 |
| 3865 | Davide Succi |  | SA 2014/15 | 326 |
| 4295 | Marc Vucinovic |  | BL1 2014/15 | 322 |
| 2515 | Nili Perdomo |  | PD 2015/16 | 318 |
| 10981 | Malcom Adu |  | PD 2022/23, PD 2023/24, PD 2024/25 | 318 |
| 3531 | Alexandre Raineau |  | FL1 2015/16 | 317 |
| 4156 | Rafael Martins |  | PD 2014/15 | 312 |
| 4293 | Didier Ya Konan |  | BL1 2014/15 | 309 |
| 2729 | Felipe Santana |  | BL1 2014/15 | 304 |
| 4001 | Stefan Ristovski |  | SA 2014/15 | 296 |
| 1875 | Vasiliy Pryima |  | SA 2015/16 | 292 |
| 11042 | Marko Milovanovic | Marko Milovanović | PD 2022/23, PD 2023/24 | 292 |
| 3876 | Ioannis Fetfatzidis |  | SA 2014/15 | 288 |
| 4211 | Víctor Pérez |  | PD 2014/15 | 283 |
| 4167 | Mané |  | PD 2014/15 | 282 |
| 11617 | Yago Alonso |  | PD 2025/26 | 275 |
| 7182 | Moisés Delgado |  | PD 2018/19 | 270 |
| 1004 | Joe Cole |  | PL 2014/15 | 263 |
| 11793 | Andy Logbo |  | FL1 2023/24, FL1 2024/25 | 247 |
| 3610 | Mory Kone | Mory Koné | FL1 2015/16 | 240 |
| 3382 | Jules Goda |  | FL1 2015/16 | 221 |
| 6305 | Ismail Aaneb |  | FL1 2018/19, FL1 2020/21 | 214 |
| 2173 | Joni Montiel |  | PD 2015/16 | 205 |
| 5965 | Seybou Koita |  | FL1 2017/18 | 205 |
| 4802 | David Ramírez |  | FL1 2014/15 | 202 |
| 4492 | José Enrique |  | PL 2014/15 | 201 |
| 2025 | Matuzalém |  | SA 2015/16 | 201 |
| 4155 | Riki |  | PD 2014/15 | 196 |
| 3764 | Benjamin Karamoko |  | FL1 2014/15, FL1 2016/17 | 194 |
| 3987 | Lucas Souza |  | SA 2014/15 | 190 |
| 3639 | Paulin Puel |  | FL1 2014/15, FL1 2015/16 | 183 |
| 12903 | Rafael Bauza |  | PD 2024/25 | 183 |
| 6845 | Percy Ruiz |  | FL1 2019/20 | 182 |
| 4889 | Vincent Aboubakar |  | FL1 2014/15 | 180 |
| 5049 | Adrià Ortolá |  | PD 2016/17 | 180 |
| 7523 | Javier Díaz |  | PD 2018/19, PD 2021/22 | 180 |
| 11005 | Joseph Whitworth |  | PL 2022/23 | 180 |
| 9424 | Pablo Cuñat |  | PD 2025/26 | 180 |
| 13905 | Mathys Silistre |  | FL1 2025/26 | 180 |
| 3467 | Florent Chaigneau |  | FL1 2015/16 | 178 |
| 11204 | Jon Magunacelaya |  | PD 2022/23, PD 2023/24, PD 2024/25 | 175 |
| 4031 | Jonathan |  | SA 2014/15 | 174 |
| 3705 | Hugo Rodriguez |  | FL1 2015/16 | 173 |
| 8353 | Antoñin | Antoñín | PD 2019/20 | 168 |
| 7251 | Robert |  | PD 2021/22, PD 2022/23 | 168 |
| 11737 | Silvi Clua |  | PD 2023/24, PD 2024/25 | 164 |
| 10755 | Joseph Hodge |  | PL 2022/23 | 162 |
| 6879 | Mohamed Lamine Diaby |  | FL1 2018/19 | 157 |
| 5186 | Roman Zozulia |  | PD 2016/17 | 144 |
| 7541 | Timothee Nkada |  | FL1 2019/20 | 135 |
| 6443 | Ben Kone | Ben Lhassine Kone | SA 2021/22, SA 2024/25 | 126 |
| 8531 | Adrià Guerrero |  | PD 2019/20 | 125 |
| 8507 | Manuel Garrido |  | PD 2019/20 | 122 |
| 10876 | Simo | Simo Keddari | PD 2022/23 | 121 |
| 4141 | Rafael Gálvez |  | PD 2014/15 | 115 |
| 9268 | Koffi |  | PD 2020/21, PD 2021/22 | 113 |
| 3882 | Isaac Donkor |  | SA 2014/15 | 112 |
| 10054 | Wahidullah Faghir |  | BL1 2021/22 | 112 |
| 3465 | Alain Traoré |  | FL1 2014/15, FL1 2015/16 | 102 |
| 3813 | Luka Djordjevic |  | SA 2014/15 | 94 |
| 1079 | Thomas Robson |  | PL 2015/16 | 90 |
| 6371 | Alejandro Robles |  | PD 2017/18 | 90 |
| 5971 | Jean-Christophe Bouet |  | FL1 2017/18 | 90 |
| 10601 | Alejandro Primo |  | PD 2021/22 | 90 |
| 11901 | Tomasso Martinelli |  | SA 2023/24 | 90 |
| 11611 | Francisco González |  | PD 2024/25 | 90 |
| 2028 | Ronaldo |  | SA 2015/16 | 88 |
| 5557 | Ben Woodburn |  | PL 2016/17, PL 2017/18 | 88 |
| 14013 | Adam El Mokhtari |  | PD 2025/26 | 85 |
| 14229 | Noam Obougou |  | FL1 2025/26 | 84 |
| 7983 | Daniel N'Lundulu |  | PL 2020/21 | 82 |
| 4087 | Álex Felip | Alex Felip | PD 2014/15 | 79 |
| 6657 | Lasse Sorenson |  | PL 2017/18 | 78 |
| 7833 | Münir Mercan |  | BL1 2019/20, BL1 2020/21 | 72 |
| 6207 | Rijad Bajic |  | SA 2017/18 | 70 |
| 4022 | Granddi N'Goyi |  | SA 2014/15 | 69 |
| 3736 | Cyriak Garel |  | FL1 2014/15 | 69 |
| 4887 | Moussa Gueye |  | FL1 2014/15 | 68 |
| 12817 | Rodrigo Abajas |  | PD 2024/25 | 68 |
| 14397 | Tai Abed |  | PD 2025/26 | 68 |
| 14174 | Pharell Hensel |  | BL1 2025/26 | 68 |
| 3923 | Ederson |  | SA 2014/15 | 66 |
| 9795 | Javier Serrano |  | PD 2021/22 | 64 |
| 12205 | Mark O’Mahony |  | PL 2023/24 | 64 |
| 5821 | Alexander Merkel |  | SA 2015/16 | 59 |
| 5806 | Faiz Selemani | Faïz Selemani | FL1 2016/17 | 58 |
| 6473 | Merveille Ndockyt |  | PD 2017/18 | 58 |
| 11292 | Lebas da Silva |  | FL1 2022/23 | 58 |
| 9844 | Aleksander Buksa |  | SA 2021/22 | 57 |
| 2459 | Álex Barrera |  | PD 2015/16 | 53 |
| 2472 | Bernard Mensah |  | PD 2015/16 | 49 |
| 14563 | Wedtoin Ouedraogo |  | SA 2025/26 | 47 |
| 10590 | Marc Urena |  | PD 2021/22 | 44 |
| 869 | Dionatan Teixeira |  | PL 2014/15, PL 2015/16 | 43 |
| 4892 | Lucas Mendes |  | FL1 2014/15 | 43 |
| 11761 | Javier Martón |  | PD 2024/25 | 43 |
| 2583 | Miguel Cardoso |  | PD 2015/16 | 40 |
| 3783 | Youssef Benali |  | FL1 2014/15, FL1 2015/16 | 39 |
| 4799 | Abdoulaye Diaby |  | FL1 2014/15, PD 2020/21 | 38 |
| 9916 | Finley Stevens |  | PL 2021/22, BL1 2024/25, BL1 2025/26 | 37 |
| 1060 | Jonathan Williams |  | PL 2014/15, PL 2015/16 | 36 |
| 1043 | Callum Connolly |  | PL 2015/16 | 33 |
| 8658 | Heriberto Tavares |  | FL1 2020/21 | 32 |
| 8679 | Samy Benchama |  | FL1 2020/21 | 31 |
| 2605 | Mendi |  | PD 2015/16 | 29 |
| 2462 | Ángel |  | PD 2015/16 | 28 |
| 10392 | Vladyslav Supryaha |  | SA 2021/22 | 28 |
| 3845 | João Silva |  | SA 2014/15 | 27 |
| 471 | Shaun MacDonald |  | PL 2015/16 | 24 |
| 11503 | Marciano Sanca |  | PD 2023/24 | 24 |
| 14089 | Lancinet Kourouma |  | PD 2025/26 | 23 |
| 12170 | Joseph Nonge |  | SA 2023/24 | 22 |
| 7147 | Hakim El Mokkedem |  | FL1 2018/19 | 21 |
| 9457 | José Boacho |  | PD 2020/21 | 21 |
| 4525 | Anderson |  | PL 2014/15 | 19 |
| 5760 | Sami Benamar |  | FL1 2019/20, FL1 2020/21 | 17 |
| 4377 | Joseph-Claude Gyau |  | BL1 2014/15 | 16 |
| 4232 | Héctor |  | PD 2014/15 | 15 |
| 13197 | Israel Domínguez |  | PD 2024/25 | 15 |
| 4428 | Daniel Lafferty |  | PL 2014/15 | 14 |
| 3753 | Eddy Maanane |  | FL1 2015/16 | 14 |
| 13385 | Zabi Gueu |  | FL1 2024/25 | 14 |
| 5764 | Alexandre Llovet |  | FL1 2016/17 | 13 |
| 12197 | Rachad Dhimi |  | PD 2023/24 | 13 |
| 12203 | Treymaurice Nyoni |  | PL 2025/26 | 13 |
| 13720 | Dan Neil |  | PL 2025/26 | 13 |
| 10181 | Alex Tirlea |  | PD 2021/22 | 12 |
| 3636 | Ilyes Chaibi | Ilyes Chaïbi | FL1 2015/16 | 10 |
| 9144 | Manuel Nieto |  | PD 2020/21 | 9 |
| 1990 | Jeremy Broh |  | SA 2014/15 | 8 |
| 429 | Francisco Rodríguez |  | BL1 2015/16 | 8 |
| 8525 | Álex Blesa |  | PD 2019/20, PD 2020/21 | 8 |
| 9311 | Thakgalo Leshabela |  | PL 2020/21 | 8 |
| 4356 | Julian Koch |  | BL1 2014/15 | 7 |
| 1914 | Aaron Mattia Tabacchi |  | SA 2015/16 | 7 |
| 4834 | Malick Seck |  | FL1 2014/15 | 5 |
| 10335 | Alasanne Sidibe |  | SA 2021/22 | 5 |
| 10151 | Aboubacar Sidibe |  | FL1 2021/22 | 5 |
| 13035 | Daniel Requena |  | PD 2024/25 | 4 |
| 13024 | Serigne Diop |  | FL1 2024/25, FL1 2025/26 | 4 |
| 14567 | Linus Güther |  | BL1 2025/26 | 4 |
| 4186 | Pol | Pol Freixanet | PD 2014/15 | 3 |
| 12636 | Vignon Ouotro |  | FL1 2023/24 | 3 |
| 937 | João Teixeira | João Carlos Teixeira | PL 2015/16 | 2 |
| 3774 | Alexis Araujo |  | FL1 2015/16 | 2 |
| 9237 | Florent da Silva |  | FL1 2020/21 | 2 |
| 562 | James Weir |  | PL 2015/16 | 1 |
| 2541 | Imanol Corral |  | PD 2015/16 | 1 |
| 3706 | Timothee Taufflieb | Timothée Taufflieb | FL1 2015/16 | 1 |
| 6673 | Francesc Regis |  | PD 2017/18 | 1 |
| 9443 | Vasilis Pavlidis |  | BL1 2020/21 | 1 |
