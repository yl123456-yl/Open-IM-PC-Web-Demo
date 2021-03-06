import { FC, useEffect, useRef, useState } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Cve, Message, PictureElem, UserInfo } from "../../../@types/open_im";
import { tipsTypes } from "../../../constants/messageContentType";
import { RootState } from "../../../store";
import { events, im } from "../../../utils";
import ScrollView from "../../../components/ScrollView";
import { MUTILMSG, OPENSINGLEMODAL } from "../../../constants/events";
import MsgItem from "./MsgItem/MsgItem";
import { useTranslation } from "react-i18next";

type ChatContentProps = {
  msgList: Message[];
  imgClick: (el: PictureElem) => void;
  loadMore: (uid?: string, gid?: string, sMsg?: any) => void;
  hasMore: boolean;
  curCve?: Cve;
  loading: boolean;
  merID?: string;
};

const ChatContent: FC<ChatContentProps> = ({ merID, msgList, imgClick, loadMore, hasMore, curCve, loading }) => {
  const [mutilSelect, setMutilSelect] = useState(false);
  const selectValue = (state: RootState) => state.user.selfInfo;
  const selfID = useSelector(selectValue, shallowEqual).uid!;
  const originFriendList = useSelector((state: RootState) => state.contacts.friendList, shallowEqual);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { t } = useTranslation();
  
  const tipList = Object.values(tipsTypes);

  useEffect(() => {
    events.on(MUTILMSG, mutilHandler);
    return () => {
      events.off(MUTILMSG, mutilHandler);
    };
  }, []);

  const mutilHandler = (flag: boolean) => {
    setMutilSelect(flag);
  };

  const parseTip = (msg: Message): string => {
    if (msg.contentType === tipsTypes.REVOKEMESSAGE) {
      return (msg.sendID === selfID ? t("You") : msg.senderNickName) + t("RevokeMessage");
    }
    switch (msg.contentType) {
      case tipsTypes.ACCEPTFRIENDNOTICE:
        return t("AlreadyFriend");
      case tipsTypes.CREATEGROUPNOTICE:
        return t("AlreadyGroup");
      case tipsTypes.ACCEPTGROUPAPPLICATIONNOTICE:
        const jointip = JSON.parse(msg.content).defaultTips;
        const joinIdx = jointip.indexOf(" join the group");
        return jointip.slice(0, joinIdx)+" "+t("JoinedGroup");
      case tipsTypes.INVITETOGROUPNOTICE:
        const invitetip = JSON.parse(msg.content).defaultTips;
        const inviteIdx = invitetip.indexOf(" invited into the group chat by ");
        return invitetip.slice(32 + inviteIdx)+t("Invited")+invitetip.slice(0, inviteIdx)+t("IntoGroup");
      case tipsTypes.QUITGROUPNOTICE:
        const quitTip = JSON.parse(msg.content).defaultTips;
        const quitIdx = quitTip.indexOf(" have quit group chat");
        return quitTip.slice(6, quitIdx)+t("QuitedGroup");
      default:
        return JSON.parse(msg.content).defaultTips;
    }
  };

  const nextFuc = () => {
    loadMore(curCve?.userID, curCve?.groupID, msgList[msgList.length - 1]);
  };

  const clickItem = async (id: string) => {
    if (id === selfID) return;
    let info;
    const idx = originFriendList.findIndex((f) => f.uid === id);
    if (idx > -1) {
      const { errCode, data } = await im.getFriendsInfo([id]);
      if (errCode === 0) {
        info = JSON.parse(data)[0];
      }
    } else {
      const { errCode, data } = await im.getUsersInfo([id]);
      if (errCode === 0) {
        info = JSON.parse(data)[0];
      }
    }
    events.emit(OPENSINGLEMODAL, info);
  };

  return (
    <div className="chat_bg">
      <ScrollView holdHeight={30} loading={loading} data={msgList} fetchMoreData={nextFuc} hasMore={hasMore}>
        {msgList?.map((msg) => {
          if (tipList.includes(msg.contentType)) {
            return (
              <div key={msg.clientMsgID} className="chat_bg_tips">
                {parseTip(msg)}
              </div>
            );
          } else {
            return <MsgItem audio={audioRef} key={msg.clientMsgID} mutilSelect={mutilSelect} msg={msg} imgClick={imgClick} selfID={merID ?? selfID} curCve={curCve!} clickItem={clickItem} />;
          }
        })}
      </ScrollView>

      <audio ref={audioRef} />
    </div>
  );
};

export default ChatContent;
