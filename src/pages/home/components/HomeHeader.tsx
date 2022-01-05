import { UserOutlined, UserAddOutlined, AudioOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import { FC, useEffect, useState } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { Cve, DetailType, GroupItem, OnLineResType, ResItemType, StringMapType } from "../../../@types/open_im";
import { getOnline } from "../../../api/admin";
import { MyAvatar } from "../../../components/MyAvatar";
import { RootState } from "../../../store";
import { isSingleCve } from "../../../utils";

import members from "@/assets/images/members.png";
import { setMember2Status } from "../../../store/actions/contacts";

const { Header } = Layout;

type HeaderProps = {
  isShowBt?: boolean;
  type: "chat" | "contact";
  title?: string;
  curCve?: Cve;
  typing?: boolean;
  ginfo?: GroupItem;
};


const HomeHeader: FC<HeaderProps> = ({ isShowBt, type, title, curCve, typing, ginfo }) => {
  const [isFriend, setIsFriend] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState("离线");
  const [onlineNo, setOnlineNo] = useState(0);
  const friendList = useSelector((state: RootState) => state.contacts.friendList, shallowEqual);
  const groupMemberList = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);
  const adminToken = useSelector((state: RootState) => state.user.adminToken, shallowEqual);
  const member2Status = useSelector((state: RootState) => state.contacts.member2status, shallowEqual);
  const dispatch =  useDispatch();

  useEffect(() => {
    const idx = friendList.findIndex((f) => f.uid == curCve?.userID);
    if (idx > -1) {
      setIsFriend(true);
    } else {
      setIsFriend(false);
    }
  }, [friendList]);

  useEffect(() => {
    if (type === "chat") {
      if (isSingleCve(curCve!)) {
        getOnline([curCve!.userID],adminToken).then((res) => {
          const statusItem = res.successResult[0];
          if (statusItem.userID === curCve?.userID) {
            switchOnline(statusItem.status, statusItem.detailPlatformStatus);
          }
        });
      } else if (!isSingleCve(curCve!) && ginfo && groupMemberList.length > 0) {
        getGroupOnline();
      }
    }
  }, [type, curCve, ginfo, groupMemberList]);

  const switchOnline = (oType: string, details?: DetailType[]) => {
    switch (oType) {
      case "offline":
        setOnlineStatus("离线");
        break;
      case "online":
        let str = "";
        details?.map((detail) => {
          if (detail.status === "online") {
            str += `${detail.platform}/`;
          }
        });
        setOnlineStatus(`${str.slice(0, -1)}在线`);
        break;
      default:
        break;
    }
  };

  const getGroupOnline = () => {
    const tmplist = [...groupMemberList];
    const total = Math.ceil(tmplist.length / 200);
    let promiseArr: Array<Promise<OnLineResType>> = [];
    for (let i = 0; i < total; i++) {
      promiseArr.push(getOnline(tmplist.splice(0, 200).map((m) => m.userId),adminToken));
    }
    Promise.all(promiseArr).then((res) => {
      let count = 0;
      let obj = {};
      res.map((pres) => {
        pres?.successResult?.map((item) => {
          obj = {...obj,[item.userID]:item}
          if (item.status === "online") {
            count += 1;
          }
        });
      });
      dispatch(setMember2Status(obj))
      setOnlineNo(count);
    });
  };

  return (
    <Header className="chat_header" style={{ borderBottom: isShowBt ? "1px solid #dedfe0" : "none" }}>
      {type === "chat" ? (
        <div className="chat_header_box">
          <div className="chat_header_box_left">
            <MyAvatar shape="square" size={42} src={curCve?.faceUrl} icon={<UserOutlined />} />
            <div className="cur_status">
              <div className="cur_status_nick">{curCve?.showName}</div>
              <div className="cur_status_update">
                {isSingleCve(curCve!) ? (
                  <>
                    <span style={{ backgroundColor: onlineStatus === "离线" ? "#959595" : "#0ecc63" }} className="icon" />
                    <span className="online">{onlineStatus}</span>
                  </>
                ) : (
                  <>
                    <div className="num">
                      <img src={members} alt="" />
                      <span>{ginfo?.memberCount}</span>
                    </div>
                    <div className="num">
                      <span className="icon" />
                      <span className="online">{`${onlineNo}人在线`}</span>
                    </div>
                  </>
                )}
                {typing ? <span className="typing">正在输入...</span> : null}
              </div>
            </div>
          </div>
          <div className="chat_header_box_right">
            <AudioOutlined />
            <PlayCircleOutlined />
            {!isFriend && isSingleCve(curCve!) && <UserAddOutlined />}
          </div>
        </div>
      ) : (
        <div className="chat_header_box">{title}</div>
      )}
    </Header>
  );
};

HomeHeader.defaultProps = {
  isShowBt: true,
};

export default HomeHeader;
