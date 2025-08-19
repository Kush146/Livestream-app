import os
import subprocess
from dotenv import load_dotenv

load_dotenv()

# Get the RTSP URL from .env
rtsp_url = os.getenv("RTSP_URL")

# Run the FFmpeg command
subprocess.run(f"ffmpeg -i {rtsp_url} -c:v libx264 -preset veryfast -tune zerolatency -f hls -hls_time 2 -hls_list_size 10 -hls_flags delete_segments+append_list output.m3u8", shell=True)
