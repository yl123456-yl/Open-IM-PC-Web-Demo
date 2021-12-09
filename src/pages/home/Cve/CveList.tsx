import { UserOutlined } from "@ant-design/icons";
import { Badge, Empty, List } from "antd";
import { FC } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { Cve, Message } from "../../../@types/open_im";
import { MyAvatar } from "../../../components/MyAvatar";
import { messageTypes, tipsTypes } from "../../../constants/messageContentType";
import { RootState } from "../../../store";
import { formatDate } from "../../../utils";

type CveItemProps = {
  cve: Cve;
  onClick: (cve: Cve) => void;
  curCve: Cve | null
  curUid: string
};

const CveItem: FC<CveItemProps> = ({ cve, onClick,curCve,curUid }) => {
  const parseLatestMsg = (lmsg: string): string => {
    const pmsg:Message = JSON.parse(lmsg);
    switch (pmsg.contentType) {
      case messageTypes.TEXTMESSAGE:
        return pmsg.content
      case messageTypes.ATTEXTMESSAGE:
        return `${pmsg.senderNickName+' '+pmsg.atElem.text}`
      case messageTypes.PICTUREMESSAGE:
        return "[图片消息]"
      case messageTypes.VIDEOMESSAGE:
        return "[视频消息]"
      case messageTypes.VOICEMESSAGE:
        return "[语音消息]"
      case messageTypes.LOCATIONMESSAGE:
        return "[位置消息]"
      case messageTypes.MERGERANDFORWARDMESSAGE:
        return "[合并转发消息]"
      case messageTypes.FILEMESSAGE:
        return "[文件消息]"
      case messageTypes.REVOKEMESSAGE:  
        return `${pmsg.sendID === curUid?'你':pmsg.senderNickName}撤回了一条消息`
      case messageTypes.CUSTOMMESSAGE:
        // console.log("自定义消息");
        return "[自定义消息]"
      case messageTypes.QUOTEMESSAGE:
        // console.log("引用消息");
        return "[引用消息]"
      case tipsTypes.ACCEPTFRIENDNOTICE:
        return "你们已经是好友啦，开始聊天吧~"
      case tipsTypes.ACCEPTGROUPAPPLICATIONNOTICE:
        const jointip = JSON.parse(pmsg.content).defaultTips
        const joinIdx = jointip.indexOf(" join the group")
        return `${jointip.slice(0,joinIdx)} 加入了群聊`
      case tipsTypes.CREATEGROUPNOTICE:
        return "你已成功加入群聊"
      case tipsTypes.INVITETOGROUPNOTICE:
        const invitetip = JSON.parse(pmsg.content).defaultTips
        const inviteIdx = invitetip.indexOf(" invited into the group chat by ")
        return `${invitetip.slice(32+inviteIdx)}邀请了${invitetip.slice(0,inviteIdx)}入群`
      case tipsTypes.QUITGROUPNOTICE:
        const quitTip = JSON.parse(pmsg.content).defaultTips
        const quitIdx = quitTip.indexOf(" have quit group chat")
        return `${quitTip.slice(6,quitIdx)} 退出了群聊`
      default:
        const tip = JSON.parse(pmsg.content)
        if(tip.isDisplay===1){
          return tip.defaultTips
        }else{
          return "tips"
        }
    }
  };

  const parseLatestTime = (ltime: number): string => {
    const sendArr = formatDate(ltime/1000000)
    const dayArr = formatDate(ltime/1000000 + 86400000)
    const curArr = formatDate(new Date().getTime())
    if(sendArr[3]===curArr[3]){
      return sendArr[4] as string
    }else if(dayArr[3]===curArr[3]){
      return "昨天"
    }else{
      return sendArr[3] as string
    }
  }

  return (
    <div
      onClick={() => onClick(cve)}
      className={`cve_item ${(curCve?.conversationID===cve.conversationID||cve.isPinned===1) ? "cve_item_focus" : ""}`}
    >
      <Badge size="small" count={cve.unreadCount}>
      <MyAvatar
        shape="square"
        style={{ minWidth: "36px" }}
        size={36}
        icon={<UserOutlined />}
        src={cve.faceUrl}
      />
      </Badge>
      
      <div className="cve_info">
        <div data-time={parseLatestTime(cve.latestMsgSendTime)} className="cve_title">
          {cve.showName}
        </div>
        <div className="cve_msg">{parseLatestMsg(cve.latestMsg)}</div>
      </div>
    </div>
  );
};

type CveListProps = {
  cveList: Cve[];
  clickItem: (cve: Cve) => void;
  loading: boolean;
  marginTop?: number;
  curCve: Cve | null
};

const CveList: FC<CveListProps> = ({ cveList, clickItem, loading, marginTop,curCve }) => {
  const curUid = useSelector((state:RootState)=>state.user.selfInfo.uid,shallowEqual)
  return (
    <div className="cve_list">
      {cveList.length > 0 ? (
        <List
        className="cve_list_scroll"
          style={{height:`calc(100vh - ${marginTop}px)`}}
          itemLayout="horizontal"
          dataSource={cveList}
          split={false}
          loading={loading}
          renderItem={item => (
            <CveItem curUid={curUid!} curCve={curCve} key={item.conversationID} onClick={clickItem} cve={item} />
          )}
        />
      ) : (
        <Empty description="暂无会话" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};

CveList.defaultProps = {
  marginTop:58
}

export default CveList;
