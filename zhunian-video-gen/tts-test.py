txt="上师知，上师知，上师知。暇满难得犹如优昙花，既得大义超胜如意宝，获得如是此身唯一回，若未修持究竟大义果，我等无义虚度此人身，总集三宝上师悲眼视，愿获暇满实义求加持。"


txt2 = """
诸法无常迁变如闪电

思维器情悉皆坏灭法

决定死亡死时却不定

心执常法唯是自欺诳

我等恒处懈怠放逸中

总集三宝上师悲眼视

能念无常死亡求加持

黑白业果永时亦不虚
于此无欺因果正道中
显现一切轮涅之诸法
虽知自作定熟于自身
我等无力如法作取舍
总集三宝上师悲眼视
能作善恶取舍求加持
具足众多难忍之苦痛
彼现安乐欺意无常众
一切有漏五蕴痛苦因
三界轮回犹处火坑中
我等不知如是尚贪世
总集三宝上师悲眼视
生起出离意乐求加持
"""

import edge_tts

communicate = edge_tts.Communicate(txt2)
communicate.save_sync("txt2.mp3")