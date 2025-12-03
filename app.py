import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
import tkinter as tk
from tkinter import filedialog

# ==================================
# 1. Загрузка изображения через диалог
# ==================================
def load_image():
    file_path = filedialog.askopenfilename(
        title="Выберите изображение",
        filetypes=[("Image files", "*.png *.jpg *.jpeg *.bmp")]
    )
    if not file_path:
        return None
    img = Image.open(file_path).convert('L')  # в оттенках серого
    img_np = np.array(img, dtype=np.float32)
    return img_np

# ==================================
# 2. Свёртка вручную
# ==================================
def convolve2d(image, kernel):
    h, w = image.shape
    kh, kw = kernel.shape
    pad_h = kh // 2
    pad_w = kw // 2
    
    padded = np.pad(image, ((pad_h, pad_h), (pad_w, pad_w)), mode='edge')
    result = np.zeros_like(image)

    for y in range(h):
        for x in range(w):
            region = padded[y:y+kh, x:x+kw]
            result[y, x] = np.sum(region * kernel)
    return result

# ==================================
# 3. Гистограмма
# ==================================
def histogram(image):
    hist = np.zeros(256, dtype=int)
    for y in range(image.shape[0]):
        for x in range(image.shape[1]):
            hist[int(image[y, x])] += 1
    return hist

# ==================================
# 4. Эквализация
# ==================================
def equalize(image):
    h = histogram(image)
    cdf = np.cumsum(h) / np.sum(h)
    eq = (cdf[image.astype(int)] * 255).astype(np.uint8)
    return eq

# ==================================
# 5. Линейное контрастирование
# ==================================
def linear_contrast(image):
    min_v = np.min(image)
    max_v = np.max(image)
    lc = ((image - min_v) * (255 / (max_v - min_v))).astype(np.uint8)
    return lc

# ==================================
# 6. Основная обработка
# ==================================
def process_image(img):
    # Лаплас (точки)
    laplace_kernel = np.array([[0, -1, 0],
                               [-1, 4, -1],
                               [0, -1, 0]], dtype=np.float32)
    laplacian = convolve2d(img, laplace_kernel)
    laplacian_abs = np.clip(np.abs(laplacian), 0, 255)

    # Собель (градиенты)
    sobel_x_kernel = np.array([[-1, 0, 1],
                               [-2, 0, 2],
                               [-1, 0, 1]], dtype=np.float32)
    sobel_y_kernel = np.array([[-1, -2, -1],
                               [ 0,  0,  0],
                               [ 1,  2,  1]], dtype=np.float32)
    
    grad_x = convolve2d(img, sobel_x_kernel)
    grad_y = convolve2d(img, sobel_y_kernel)
    sobel = np.sqrt(grad_x**2 + grad_y**2)
    sobel_abs = np.clip(sobel, 0, 255)

    # Простой детектор границ по порогу
    threshold = 50
    edges = (sobel > threshold) * 255

    # Гистограмма
    hist = histogram(img)

    # Эквализация
    equalized = equalize(img)
    hist_eq = histogram(equalized)

    # Линейное контрастирование
    linear = linear_contrast(img)

    # Визуализация
    plt.figure(figsize=(14, 12))

    plt.subplot(3, 3, 1)
    plt.title("Исходное")
    plt.imshow(img, cmap='gray')

    plt.subplot(3, 3, 2)
    plt.title("Лаплас (точки)")
    plt.imshow(laplacian_abs, cmap='gray')

    plt.subplot(3, 3, 3)
    plt.title("Градиенты (Собель)")
    plt.imshow(sobel_abs, cmap='gray')

    plt.subplot(3, 3, 4)
    plt.title("Простой детектор границ")
    plt.imshow(edges, cmap='gray')

    plt.subplot(3, 3, 5)
    plt.title("Гистограмма")
    plt.plot(hist)

    plt.subplot(3, 3, 6)
    plt.title("Эквализация")
    plt.imshow(equalized, cmap='gray')

    plt.subplot(3, 3, 7)
    plt.title("Гистограмма эквализации")
    plt.plot(hist_eq)

    plt.subplot(3, 3, 8)
    plt.title("Линейное контрастирование")
    plt.imshow(linear, cmap='gray')

    plt.tight_layout()
    plt.show()

# ==================================
# 7. Интерфейс Tkinter
# ==================================
def main():
    root = tk.Tk()
    root.withdraw()  # скрываем главное окно
    img = load_image()
    if img is not None:
        process_image(img)
    else:
        print("Изображение не выбрано!")

if __name__ == "__main__":
    main()
