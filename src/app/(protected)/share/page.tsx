"use client";

import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  XIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
  RedditShareButton,
  RedditIcon,
  EmailShareButton,
  EmailIcon,
} from "react-share";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy } from "lucide-react";

const SHARE_URL =
  typeof window !== "undefined" ? window.location.origin : "https://gottamatch.emall";
const SHARE_TITLE = "Gotta Match 'Em All - A multiplayer Pokemon card matching game!";
const SHARE_MESSAGE =
  "Come play Gotta Match 'Em All! Flip cards, match Pokemon, and build your collection.";

export default function SharePage() {
  function copyToClipboard() {
    navigator.clipboard.writeText(SHARE_URL);
    toast.success("Link copied to clipboard!");
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-purple-700">Share the Game!</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Invite friends to play
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label>Share link</Label>
            <div className="flex gap-2">
              <Input value={SHARE_URL} readOnly className="bg-muted" />
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label>Share on social media</Label>
            <div className="flex flex-wrap gap-3">
              <FacebookShareButton url={SHARE_URL} title={SHARE_TITLE}>
                <FacebookIcon size={44} round />
              </FacebookShareButton>

              <TwitterShareButton url={SHARE_URL} title={SHARE_TITLE}>
                <XIcon size={44} round />
              </TwitterShareButton>

              <WhatsappShareButton url={SHARE_URL} title={SHARE_MESSAGE}>
                <WhatsappIcon size={44} round />
              </WhatsappShareButton>

              <LinkedinShareButton url={SHARE_URL} title={SHARE_TITLE}>
                <LinkedinIcon size={44} round />
              </LinkedinShareButton>

              <RedditShareButton url={SHARE_URL} title={SHARE_TITLE}>
                <RedditIcon size={44} round />
              </RedditShareButton>

              <EmailShareButton
                url={SHARE_URL}
                subject={SHARE_TITLE}
                body={SHARE_MESSAGE}
              >
                <EmailIcon size={44} round />
              </EmailShareButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
