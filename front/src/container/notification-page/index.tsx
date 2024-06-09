import { useState, useEffect } from "react";
import "./index.css";

import Title from "../../component/title";
import BackButton from "../../component/back-button";

import { useParams } from "react-router-dom";

import warning from "./warning.svg";
import announce from "./announce.svg";

const NotificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [errorData, setErrorData] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (id) {
        try {
          const res = await fetch(
            `https://povshy.github.io/pov24/notification?id=${id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message);
          }

          const data = await res.json();
          setNotifications(data.notifications);
          console.log("Notifications received:", data.notifications);
        } catch (error: any) {
          console.error("Error fetching notifications:", error.message);
          setErrorData(error.message);
        }
      }
    };

    fetchNotifications();
  }, [id]);

  const logoMap: { [key: string]: string } = {
    Warning: warning,
    Announcement: announce,
  };

  const getLogo = (notifications: { name: string }) => {
    if (notifications.name === "Warning") {
      return logoMap.Warning;
    }
    return logoMap.Announcement;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMins / 60);

    const hours = diffHrs;
    const minutes = diffMins % 60;

    if (hours > 0) {
      return `${hours} h. ${minutes} min. ago`;
    } else {
      return `${minutes} min. ago`;
    }
  };

  return (
    <div>
      <BackButton />
      <div className="sending-page">
        <Title title="Notification" />
        {errorData ? (
          <p className="error-message">{errorData}</p>
        ) : (
          <div className="notifications-list">
            {notifications
              .slice()
              .reverse()
              .map((notification, index) => (
                <div key={index} className="notifications__item">
                  <div className="transaction__logo">
                    <img src={getLogo(notification)} alt={notification.name} />
                  </div>

                  <div className="transaction__info">
                    <h4 className="transaction__name">{notification.type}</h4>
                    <span className="trans__date">
                      {formatTimeAgo(notification.time)}---{notification.name}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
