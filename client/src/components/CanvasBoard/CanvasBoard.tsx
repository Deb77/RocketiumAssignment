import React, { useRef, useEffect, useState, type JSX } from "react";
import { useLocation } from "react-router-dom";
import * as fabric from "fabric";
import { Modal, Button, List, Mentions } from "antd";
import styles from "./CanvasBoard.module.css";
import { useCanvasState } from "../../context/CanvasContexts";
import { useAppSelector } from "../../store";
import { parseMentions } from "../../helpers/commentHelpers";

import api from "../../api";
const { Option } = Mentions;

interface MentionUser {
  id: string;
  name: string;
  email: string;
}

interface Reply {
  _id?: string;
  text: string;
  mentions: string[];
  createdAt?: string;
  author?: { _id?: string; name?: string; email?: string };
}

interface CommentItem {
  _id: string;
  canvas: string;
  x: number;
  y: number;
  text: string;
  mentions: string[];
  replies: Reply[];
  author?: { _id?: string; name?: string; email?: string };
}

function CanvasBoard() {
  const { setCanvas } = useCanvasState();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { isCommentMode } = useAppSelector((state) => state.ui);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(
    null
  );
  const [replyText, setReplyText] = useState("");
  const [isAddCommentOpen, setIsAddCommentOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [pendingPosition, setPendingPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const canvasId = params.get("canvasId");

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new fabric.Canvas(
        canvasRef.current as HTMLCanvasElement,
        { width: 500, height: 500 }
      );
      initCanvas.backgroundColor = "#fff";
      initCanvas.renderAll();
      setCanvas(initCanvas);

      return () => {
        initCanvas.dispose();
      };
    }
  }, []);

  const fetchComments = async () => {
    try {
      if (!canvasId) return;
      const res = await api.get(`/api/canvas/${canvasId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMentionUsers = async () => {
    try {
      if (!canvasId) return;
      const res = await api.get(`/api/canvas/${canvasId}/users`);
      setMentionUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const renderTextWithMentions = (text: string, mentions: string[]) => {
    if (!text || !mentions || mentions.length === 0) return text;
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = mentions.map(esc).join("|");
    if (!pattern) return text;

    const regex = new RegExp(`@?(?:${pattern})`, "g");
    const nodes: Array<string | JSX.Element> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = regex.lastIndex;
      if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
      nodes.push(
        <span key={`${start}-${end}`} className={styles.mentionHighlight}>
          {text.slice(start, end)}
        </span>
      );
      lastIndex = end;
    }
    if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
    return <>{nodes}</>;
  };

  useEffect(() => {
    fetchComments();
    fetchMentionUsers();
  }, [canvasId]);

  const handleCommentPlacement = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !canvasId) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPendingPosition({ x, y });
    setNewCommentText("");
    setIsAddCommentOpen(true);
  };

  const handleSaveNewComment = async () => {
    if (!canvasId || !pendingPosition || !newCommentText.trim()) return;
    try {
      const mentions = parseMentions(newCommentText, mentionUsers);
      const res = await api.post(`/api/canvas/${canvasId}/comments`, {
        x: pendingPosition.x,
        y: pendingPosition.y,
        text: newCommentText.trim(),
        mentions,
      });
      const newComment: CommentItem = res.data;
      setComments((prev) => [...prev, newComment]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddCommentOpen(false);
      setPendingPosition(null);
      setNewCommentText("");
    }
  };

  const handleCancelNewComment = () => {
    setIsAddCommentOpen(false);
    setPendingPosition(null);
    setNewCommentText("");
  };

  const handleAddReply = async () => {
    if (!replyText.trim() || !selectedComment) return;

    try {
      const mentions = parseMentions(replyText, mentionUsers);
      const res = await api.post(
        `/api/canvas/comments/${selectedComment._id}/replies`,
        {
          text: replyText,
          mentions,
        }
      );
      const newReply: Reply = res.data;

      const updatedComments = comments.map((c) =>
        c._id === selectedComment._id
          ? { ...c, replies: [...c.replies, newReply] }
          : c
      );

      setComments(updatedComments);
      setSelectedComment((prev) =>
        prev ? { ...prev, replies: [...prev.replies, newReply] } : null
      );
      setReplyText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkerClick = (comment: CommentItem) => {
    setSelectedComment(comment);
    setReplyText("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} />

        {isCommentMode && (
          <div
            className={styles.overlay}
            onClick={handleCommentPlacement}
            title="Click to add comment"
          />
        )}

        {comments.map((comment) => (
          <div
            key={comment._id}
            className={styles.commentMarker}
            style={{ top: comment.y, left: comment.x }}
            onClick={() => handleMarkerClick(comment)}
          >
            💬
          </div>
        ))}
      </div>

      <Modal
        title="Add Comment"
        open={isAddCommentOpen}
        onCancel={handleCancelNewComment}
        onOk={handleSaveNewComment}
        okButtonProps={{ disabled: !newCommentText.trim() }}
      >
        <Mentions
          style={{ width: "100%" }}
          value={newCommentText}
          onChange={(val) => setNewCommentText(val)}
          placeholder="Type your comment... use @ to mention"
          rows={3}
        >
          {mentionUsers.map((user) => (
            <Option key={String(user.id)} value={user.name}>
              {user.name}
            </Option>
          ))}
        </Mentions>
      </Modal>

      <Modal
        title="Comment & Replies"
        open={!!selectedComment}
        onCancel={() => setSelectedComment(null)}
        footer={null}
      >
        {selectedComment && (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <div>
                <strong>{selectedComment.author?.name || "Unknown"}</strong>
              </div>
              <p style={{ marginTop: 4 }}>
                {renderTextWithMentions(
                  selectedComment.text,
                  selectedComment.mentions
                )}
              </p>
            </div>

            <List
              dataSource={selectedComment.replies || []}
              header={`${selectedComment.replies.length} ${
                selectedComment.replies.length === 1 ? "Reply" : "Replies"
              }`}
              renderItem={(reply) => (
                <List.Item key={reply._id}>
                  <div>
                    <div>
                      <strong>{reply.author?.name || "Unknown"}</strong>
                    </div>
                    <div>
                      {renderTextWithMentions(reply.text, reply.mentions)}
                    </div>
                  </div>
                </List.Item>
              )}
            />

            <Mentions
              style={{ width: "100%", marginTop: "10px" }}
              value={replyText}
              onChange={(val) => setReplyText(val)}
              placeholder="Write a reply, use @ to mention..."
              rows={3}
            >
              {mentionUsers.map((user) => (
                <Option key={String(user.id)} value={user.name}>
                  {user.name}
                </Option>
              ))}
            </Mentions>

            <Button
              type="primary"
              style={{ marginTop: "10px" }}
              onClick={handleAddReply}
            >
              Add Reply
            </Button>
          </>
        )}
      </Modal>
    </div>
  );
}

export default CanvasBoard;
