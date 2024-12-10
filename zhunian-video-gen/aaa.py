#!/usr/bin/env python3

"""Sync variant of the example for generating audio with a predefined voice"""

import edge_tts

TEXT = "黄淑群女士"
OUTPUT_FILE = "name.mp3"


def main() -> None:
    """Main function"""
    communicate = edge_tts.Communicate(TEXT)
    communicate.save_sync(OUTPUT_FILE)


if __name__ == "__main__":
    main()