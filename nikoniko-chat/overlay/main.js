import Spider from '../../spider/spider.js';
import LikeManager from '../../spider/LikeManager.js';

const setting = {
    comment_enable: true,
    comment_strokeColor: null,
    comment_fontColor: null,

    gift_enable: true,
    gift_fontColor: null,
    gift_bgColor: null,

    follow_enable: true,
    follow_fontColor: null,
    follow_bgColor: null,

    like_enable: true,
    like_fontColor: null,
    like_bgColor: null,
}

const params = new URLSearchParams(window.location.search);
for (const key of Object.keys(setting)) {
    const val = params.get(key);
    if (val !== null) {
        setting[key] = val;
    }
}
console.log(setting);


const spider = new Spider();
const likeManager = new LikeManager(500);

const displayLayer = document.createElement('div');
displayLayer.className = 'display-layer';
document.body.appendChild(displayLayer);

let lastLayerTop = -1000;
let lastLayerHeight = 0;

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const getRandomTop = (itemHeight) => {
    const maxTop = Math.max(0, window.innerHeight - itemHeight - 12);
    const laneCount = Math.max(
        4,
        Math.min(10, Math.floor(window.innerHeight / 48)),
    );
    const laneHeight = Math.max(
        36,
        Math.floor((window.innerHeight - 16) / laneCount),
    );
    const lanes = Array.from({ length: laneCount }, (_, i) =>
        Math.min(maxTop, 8 + i * laneHeight),
    );
    shuffleArray(lanes);

    const minDistance = Math.max(48, Math.round(lastLayerHeight * 0.6));
    const safeTop = lanes.find(
        (top) => Math.abs(top - lastLayerTop) >= minDistance,
    );
    if (safeTop !== undefined) {
        return safeTop;
    }

    return lanes.reduce((best, top) =>
        Math.abs(top - lastLayerTop) > Math.abs(best - lastLayerTop) ? top : best,
    );
};


const getSettingInfo = (key) => {
    const result = {}
    for (const settingKey of Object.keys(setting)) {
        if (settingKey.startsWith(key)) {
            result[settingKey.replace(key + '_', '')] = setting[settingKey];
        }
    }
    return result;
}

const addItem = (item) => {
    const settingInfo = getSettingInfo('comment');
    displayLayer.appendChild(item);
    item.classList.add('item');
    item.style.position = 'absolute';
    item.style.left = '100%';
    item.style.whiteSpace = 'nowrap';
    item.style.pointerEvents = 'none';

    const itemHeight = item.offsetHeight;
    const top = getRandomTop(itemHeight);
    item.style.top = `${top}px`;
    lastLayerTop = top;
    lastLayerHeight = itemHeight;

    const duration = 10 + Math.random() * 8;
    item.style.animation = `slide-left ${duration}s linear forwards`;

    item.addEventListener('animationend', () => {
        if (item.parentElement) {
            item.parentElement.removeChild(item);
        }
    });
};

const addComment = (data) => {
    const settingInfo = getSettingInfo('comment');
    const comment = data.data.comment;
    if (String(comment)[0] === '@') {
        return;
    }
    const nickname = data.data.nickname;
    const profilePictureUrl = data.data.profilePictureUrl;
    const followStatus = data.data.followInfo.followStatus;
    const commentItem = document.createElement('div');

    const strokeColor = settingInfo.strokeColor ?? '#000000';
    const fontColor = settingInfo.fontColor ?? '#ffffff';

    if (profilePictureUrl) {
        const img = document.createElement('img');
        img.src = profilePictureUrl;
        img.alt = '';
        commentItem.appendChild(img);
    }

    const msg = document.createElement('div');
    msg.innerText = `${nickname}: ${comment}`;

    msg.dataset.fontColor = fontColor;
    msg.dataset.strokeColor = strokeColor;
    msg.classList.add('msg');

    commentItem.appendChild(msg);
    commentItem.classList.add('chat-item');
    addItem(commentItem);
};

const addGift = (data) => {
    const settingInfo = getSettingInfo('gift');
    const nickname = data.data.nickname;
    const profilePictureUrl = data.data.profilePictureUrl;
    const repeatCount = data.data.repeatCount;
    const giftName = data.data.giftName;
    const giftPictureUrl = data.data.giftPictureUrl;
    const repeatEnd = data.data.repeatEnd;
    const giftType = data.data.gift.gift_type;

    if (giftType === 1 && repeatEnd === false) {
        return;
    }

    const giftItem = document.createElement('div');
    const img = document.createElement('img');
    const msg = document.createElement('div');
    const cntDesc = repeatCount > 1 ? `${repeatCount}つ` : '';
    msg.innerText = `${nickname}さんが${giftName}を${cntDesc}送りました！`;
    img.src = giftPictureUrl;
    giftItem.appendChild(img);
    giftItem.appendChild(msg);
    giftItem.classList.add('gift-item');
    giftItem.dataset.bgColor = settingInfo.bgColor + '86' ?? '#ffdddd86';    
    giftItem.dataset.fontColor = settingInfo.fontColor + '86' ?? '#ff3d3d';
    addItem(giftItem);
};

const addFollow = (data) => {
    const settingInfo = getSettingInfo('follow');
    const nickname = data.data.nickname;
    const profilePictureUrl = data.data.profilePictureUrl;
    const fllowItem = document.createElement('div');
    const img = document.createElement('img');
    const msg = document.createElement('div');
    msg.innerText = `${nickname}さんがフォローしました！`;
    img.src = profilePictureUrl;
    fllowItem.appendChild(img);
    fllowItem.appendChild(msg);
    fllowItem.classList.add('follow-item')
    fllowItem.dataset.bgColor = settingInfo.bgColor + '86' ?? '#8acaff86';
    fllowItem.dataset.fontColor = settingInfo.fontColor + '86' ?? '#19588b';
    addItem(fllowItem);
};

const addLike = (data, cnt) => {
    const settingInfo = getSettingInfo('like');
    const nickname = data.data.nickname;
    const profilePictureUrl = data.data.profilePictureUrl;
    const likeItem = document.createElement('div');
    const img = document.createElement('img');
    const msg = document.createElement('div');
    msg.innerText = `${nickname}さんが${cnt}回いいねしました！`;
    img.src = profilePictureUrl;
    likeItem.appendChild(img);
    likeItem.appendChild(msg);
    likeItem.classList.add('like-item')
    likeItem.dataset.bgColor = settingInfo.bgColor + '86' ?? '#c0841486';
    likeItem.dataset.fontColor = settingInfo.fontColor + '86' ?? '#ffffff';
    addItem(likeItem);
}

if (setting.comment_enable === 'true') {
    spider.addEventListener('chat', addComment);
}
if (setting.gift_enable === 'true') {
    spider.addEventListener('gift', addGift);
}
if (setting.follow_enable === 'true') {
    spider.addEventListener('follow', addFollow);
}
if (setting.like_enable === 'true') {
    spider.addEventListener('like', (data) => {
        likeManager.addData(data);
    });
    likeManager.addEventListener('alert', addLike);
}


// setInterval(() => {
//   addComment({
//     event: 'chat',
//     data: {
//       emotes: [],
//       comment: 'あいうナス！！！えお',
//       userIdentity: {
//         isGiftGiverOfAnchor: true,
//         isFollowerOfAnchor: true,
//       },
//       userId: '7128736512639878146',
//       secUid:
//         'MS4wLjABAAAAdJDyZYv0MWBksFXHcUi52Aczls9OA7QZ_XBtmnYmufzAEbbosV23UXx3LWPYUbfe',
//       uniqueId: 'subaru.00939',
//       nickname: '昴流🐟🪴',
//       profilePictureUrl:
//         'https://p16-common-sign.tiktokcdn.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktok-shrink:72:72.webp?dr=14561&refresh_token=0674f160&x-expires=1786528800&x-signature=bjo4Owak2rs6qWp9r5ny%2Bzo6Ua0%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my3',
//       followRole: 1,
//       userBadges: [
//         {
//           type: 'image',
//           badgeSceneType: 6,
//           displayType: 1,
//           url: 'https://p19-webcast.tiktokcdn.com/webcast-sg/new_top_gifter_version_2.png~tplv-obj.image',
//         },
//         {
//           type: 'privilege',
//           privilegeId: '7138381747292526372',
//           level: 14,
//           badgeSceneType: 8,
//         },
//         {
//           type: 'privilege',
//           privilegeId: '7196929090442529541',
//           level: 14,
//           badgeSceneType: 10,
//         },
//       ],
//       userSceneTypes: [6, 8, 10, 6],
//       userDetails: {
//         createTime: '0',
//         bioDescription: '',
//         profilePictureUrls: [
//           'https://p16-common-sign.tiktokcdn.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktok-shrink:72:72.webp?dr=14561&refresh_token=0674f160&x-expires=1786528800&x-signature=bjo4Owak2rs6qWp9r5ny%2Bzo6Ua0%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my3',
//           'https://p19-common-sign.tiktokcdn.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktok-shrink:72:72.webp?dr=14561&refresh_token=1e036159&x-expires=1786528800&x-signature=fvDWKFLtCkcK7vpb%2BU2ZugWCGQg%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my3',
//           'https://p16-common-sign.tiktokcdn.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktok-shrink:72:72.jpeg?dr=14561&refresh_token=a62ce140&x-expires=1786528800&x-signature=2NmXOroCs17gbVZhQcQKD92gPNE%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my3',
//           'https://p16-common-sign.tiktokcdn-us.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktok-shrink:72:72.webp?dr=18049&refresh_token=5d26fb79&x-expires=1786528800&x-signature=ZP6gxsaAO%2F0Fwr12Hw4yu3jAeAs%3D&t=4d5b0474&ps=ae600521&shp=a5d48078&shcp=fdd36af4&idc=my3',
//           'https://p19-common-sign.tiktokcdn-us.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktok-shrink:72:72.webp?dr=18049&refresh_token=04246e70&x-expires=1786528800&x-signature=TC2g8fwwAbe%2Fsj4s8XrrhEQ28wY%3D&t=4d5b0474&ps=ae600521&shp=a5d48078&shcp=fdd36af4&idc=my3',
//           'https://p16-common-sign.tiktokcdn-us.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktok-shrink:72:72.jpeg?dr=18049&refresh_token=54999d3a&x-expires=1786528800&x-signature=XEqhRecT30Fd%2BukAP19L%2B%2FDpYTg%3D&t=4d5b0474&ps=ae600521&shp=a5d48078&shcp=fdd36af4&idc=my3',
//         ],
//       },
//       followInfo: {
//         followingCount: 70,
//         followerCount: 24,
//         followStatus: 1,
//         pushStatus: 0,
//       },
//       isModerator: false,
//       isNewGifter: false,
//       isSubscriber: false,
//       topGifterRank: 1,
//       gifterLevel: 14,
//       teamMemberLevel: 14,
//       msgId: '7672340876970445569',
//       createTime: '1786356074782',
//       tikfinityUserId: 3004579,
//       tikfinityUsername: 'mole_tartare_bowl',
//     },
//   });
// }, 1000);

// setInterval(() => {
//   addGift({
//     event: 'gift',
//     data: {
//       giftId: 7934,
//       repeatCount: 5,
//       userIdentity: {
//         isGiftGiverOfAnchor: true,
//         isFollowerOfAnchor: true,
//       },
//       userId: '7128736512639878146',
//       secUid:
//         'MS4wLjABAAAAdJDyZYv0MWBksFXHcUi52Aczls9OA7QZ_XBtmnYmufzAEbbosV23UXx3LWPYUbfe',
//       uniqueId: 'subaru.00939',
//       nickname: '昴流🐟🪴',
//       profilePictureUrl:
//         'https://p19-common-sign.tiktokcdn.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktokx-cropcenter:100:100.webp?dr=14579&refresh_token=7c03ab30&x-expires=1786528800&x-signature=yqQmC2DNTjIRf1ll0lDTssJW%2F7Q%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my3',
//       followRole: 0,
//       userBadges: [
//         {
//           type: 'privilege',
//           privilegeId: '7138381747292526372',
//           level: 14,
//           badgeSceneType: 8,
//         },
//         {
//           type: 'privilege',
//           privilegeId: '7196929090442529541',
//           level: 14,
//           badgeSceneType: 10,
//         },
//       ],
//       userSceneTypes: [8, 10],
//       userDetails: {
//         createTime: '0',
//         bioDescription: '',
//         profilePictureUrls: [
//           'https://p19-common-sign.tiktokcdn.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktokx-cropcenter:100:100.webp?dr=14579&refresh_token=7c03ab30&x-expires=1786528800&x-signature=yqQmC2DNTjIRf1ll0lDTssJW%2F7Q%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my3',
//           'https://p16-common-sign.tiktokcdn.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktokx-cropcenter:100:100.webp?dr=14579&refresh_token=7d1a3ca7&x-expires=1786528800&x-signature=zLRt08KF2MG8pDko%2Ft7G9Nt0dLo%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my3',
//           'https://p19-common-sign.tiktokcdn.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktokx-cropcenter:100:100.jpeg?dr=14579&refresh_token=f14911f2&x-expires=1786528800&x-signature=Vpw2QmVhre0hFBEL8ed5oazSOQo%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my3',
//           'https://p16-common-sign.tiktokcdn-us.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktokx-cropcenter:100:100.webp?dr=18067&refresh_token=ff056bb0&x-expires=1786528800&x-signature=YqZ2JeKSkvdsgiyii1WBFMQ39Bk%3D&t=4d5b0474&ps=ae600521&shp=a5d48078&shcp=fdd36af4&idc=my3',
//           'https://p19-common-sign.tiktokcdn-us.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktokx-cropcenter:100:100.webp?dr=18067&refresh_token=b9c360ad&x-expires=1786528800&x-signature=%2B6pktKxMe92U8GxG2GK6rQPg3qI%3D&t=4d5b0474&ps=ae600521&shp=a5d48078&shcp=fdd36af4&idc=my3',
//           'https://p16-common-sign.tiktokcdn-us.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktokx-cropcenter:100:100.jpeg?dr=18067&refresh_token=ccf96fa8&x-expires=1786528800&x-signature=5XfGtS6WpOimGyXVYv61yLOJizQ%3D&t=4d5b0474&ps=ae600521&shp=a5d48078&shcp=fdd36af4&idc=my3',
//         ],
//       },
//       followInfo: {
//         followingCount: 70,
//         followerCount: 24,
//         followStatus: 0,
//         pushStatus: 0,
//       },
//       isModerator: false,
//       isNewGifter: false,
//       isSubscriber: false,
//       topGifterRank: 0,
//       gifterLevel: 14,
//       teamMemberLevel: 14,
//       msgId: '7672340873010563841',
//       createTime: '1786356065011',
//       displayType: 'webcast_aweme_gift_send_messageNew',
//       label: '{0:user} sent {1:gift} × {2:string}',
//       repeatEnd: false,
//       gift: {
//         gift_id: 7934,
//         repeat_count: 1,
//         repeat_end: 0,
//         gift_type: 4,
//       },
//       describe: 'さんがハートミー を送りました',
//       giftType: 4,
//       diamondCount: 1,
//       giftName: 'ハートミー',
//       giftPictureUrl:
//         'https://p19-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/composed.2548762763a8d85b9afeef8f1acec82e.png~tplv-obj.png',
//       timestamp: 1786356065012,
//       receiverUserId: '6759090501079811074',
//       groupId: '0',
//       originalName: 'Heart Me',
//       originalDescribe: 'Sent Heart Me',
//       tikfinityUserId: 3004579,
//       tikfinityUsername: 'mole_tartare_bowl',
//     },
//   });
// }, 1000);

// setInterval(() => {
//   addFollow({
//     event: 'follow',
//     data: {
//       followerCount: 652,
//       userId: '7466451152457155591',
//       secUid:
//         'MS4wLjABAAAA1usam9FiYROC9J67k8emRFSpfiN4BjpEufE_A4HRVNlC451uspZdy5G-NKIUu8NI',
//       uniqueId: 'user45942959373188',
//       nickname: 'いあいあい',
//       profilePictureUrl:
//         'https://p16-common-sign.tiktokcdn.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktok-shrink:72:72.webp?dr=14561&refresh_token=0674f160&x-expires=1786528800&x-signature=bjo4Owak2rs6qWp9r5ny%2Bzo6Ua0%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my3',
//       followRole: 0,
//       userBadges: [],
//       userSceneTypes: [],
//       userDetails: {
//         createTime: '0',
//         bioDescription: '',
//         profilePictureUrls: [
//           'https://p16-common-sign.tiktokcdn.com/tos-alisg-avt-0068/996cfd0160285d64cdb6f1d963f88aef~tplv-tiktok-shrink:72:72.webp?dr=14561&refresh_token=e1d51b13&x-expires=1786528800&x-signature=NyvT51hwAhlj5ZW1x1zfbf09T3U%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my2',
//           'https://p19-common-sign.tiktokcdn.com/tos-alisg-avt-0068/996cfd0160285d64cdb6f1d963f88aef~tplv-tiktok-shrink:72:72.webp?dr=14561&refresh_token=2fc35887&x-expires=1786528800&x-signature=G52O11deVBa2Y7OFGOHaez1LEiE%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my2',
//           'https://p16-common-sign.tiktokcdn.com/tos-alisg-avt-0068/996cfd0160285d64cdb6f1d963f88aef~tplv-tiktok-shrink:72:72.jpeg?dr=14561&refresh_token=ba01c462&x-expires=1786528800&x-signature=OaD4c%2FQYnHeuyDRFynd0Az4qyIs%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my2',
//           'https://p16-common-sign.tiktokcdn-us.com/tos-alisg-avt-0068/996cfd0160285d64cdb6f1d963f88aef~tplv-tiktok-shrink:72:72.webp?dr=18049&refresh_token=ccb53478&x-expires=1786528800&x-signature=31IknrAjMb2Q6T9ryQ0HI2afS3M%3D&t=4d5b0474&ps=ae600521&shp=a5d48078&shcp=fdd36af4&idc=my2',
//           'https://p19-common-sign.tiktokcdn-us.com/tos-alisg-avt-0068/996cfd0160285d64cdb6f1d963f88aef~tplv-tiktok-shrink:72:72.webp?dr=18049&refresh_token=d441ae49&x-expires=1786528800&x-signature=yLLtZdxnGPyvEnMi%2F5XZuPULkNA%3D&t=4d5b0474&ps=ae600521&shp=a5d48078&shcp=fdd36af4&idc=my2',
//           'https://p16-common-sign.tiktokcdn-us.com/tos-alisg-avt-0068/996cfd0160285d64cdb6f1d963f88aef~tplv-tiktok-shrink:72:72.jpeg?dr=18049&refresh_token=f963ea1c&x-expires=1786528800&x-signature=nBqgkc2fUFL%2FMYz%2FvtdcaesNjiA%3D&t=4d5b0474&ps=ae600521&shp=a5d48078&shcp=fdd36af4&idc=my2',
//         ],
//       },
//       followInfo: {
//         followingCount: 93,
//         followerCount: 36,
//         followStatus: 0,
//         pushStatus: 0,
//       },
//       isModerator: false,
//       isNewGifter: false,
//       isSubscriber: false,
//       topGifterRank: 0,
//       gifterLevel: 0,
//       teamMemberLevel: 0,
//       msgId: '7672354610951654164',
//       createTime: '1786359262858',
//       displayType: 'pm_main_follow_message_viewer_2',
//       label: '{0:user} followed the LIVE creator',
//       profile: 'user45942959373188',
//       name: 'user45942959373188',
//       username: 'user45942959373188',
//       tikfinityUserId: 3004579,
//       tikfinityUsername: 'mole_tartare_bowl',
//     },
//   });
// }, 1000);

// setInterval(() => {
//   likeManager.addData(
//         {
//         "event": "like",
//         "data": {
//           likeCount: 500,
//           userId: 'test_user',
//           "nickname": "昴流🐟🪴",
//           "profilePictureUrl": "https://p16-common-sign.tiktokcdn.com/tos-alisg-avt-0068/482f74a7d03aebb70133148f3593e602~tplv-tiktok-shrink:72:72.webp?dr=14561&refresh_token=0674f160&x-expires=1786528800&x-signature=bjo4Owak2rs6qWp9r5ny%2Bzo6Ua0%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my3",
//         }
//     },
//   )
// }, 1000);