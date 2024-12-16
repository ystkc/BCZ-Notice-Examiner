def print_unicode_codes(text):
    # 遍历输入文本中的每一个字符
    for char in text:
        # 使用 ord() 函数获取字符的 Unicode 码点
        unicode_code = ord(char)
        # 打印字符和它的 Unicode 码点
        print(f'Character: {char}, Unicode Code Point: U+{unicode_code:04X}')

import matplotlib.pyplot as plt
plt.ion()
try:
    while True:
        text = input('Enter a text(&#DEC xHEX): ')
        if text[0] == '&':
            # 将 HTML 实体字符转换为 Unicode 字符
            text = chr(int(text[2:], 10))
            print(text)
        elif text[0] == 'x':
            # 将十六进制 Unicode 码点转换为 Unicode 字符
            text = chr(int(text[1:], 16))
            print(text)
        else:
            print_unicode_codes(text)
except KeyboardInterrupt:
    pass
plt.ioff()