import os
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, TiffTags, ImageFile
import threading
from datetime import datetime
import struct


ImageFile.LOAD_TRUNCATED_IMAGES = True

class ImageInfoExtractor:
    def __init__(self):
        self.supported_formats = {'.jpg', '.jpeg', '.gif', '.tif', '.tiff', '.bmp', '.png', '.pcx'}
    
    def get_image_info(self, file_path):
        try:
            
            file_size = os.path.getsize(file_path)
            file_size_kb = file_size / 1024
            
            
            if file_path.lower().endswith(('.bmp')):
                return self._get_bmp_info(file_path, file_size_kb)
            
            with Image.open(file_path) as img:
                
                compression_ratio = self._calculate_compression_ratio(img, file_size)
                
                info = {
                    'filename': os.path.basename(file_path),
                    'file_size': f"{file_size_kb:.1f} KB",
                    'format': img.format,
                    'size': f"{img.size[0]}×{img.size[1]}",
                    'mode': img.mode,
                    'color_depth': self._get_color_depth(img.mode),
                    'compression': compression_ratio,
                    'raw_file_size': file_size
                }
                
                
                dpi_x, dpi_y = self._get_dpi(img)
                info['dpi'] = f"{dpi_x}×{dpi_y}"
                
                
                info['compression_type'] = self._get_compression_type(img, file_path)
                
                
                info.update(self._get_format_specific_info(img, file_path))
                
                return info
                
        except Exception as e:
            return {
                'filename': os.path.basename(file_path),
                'file_size': 'N/A',
                'error': f"Ошибка чтения: {str(e)}",
                'size': 'N/A',
                'dpi': 'N/A',
                'color_depth': 'N/A',
                'compression': 'N/A',
                'compression_type': 'N/A',
                'format_specific': ''
            }
    
    def _calculate_compression_ratio(self, img, file_size):
        try:
            
            width, height = img.size
            bits_per_pixel = self._get_bits_per_pixel(img.mode)
            
            
            uncompressed_bits = width * height * bits_per_pixel
            
            uncompressed_bytes = uncompressed_bits / 8
            
            if uncompressed_bytes == 0:
                return "0%"
            
            
            compression_ratio = (1 - (file_size / uncompressed_bytes)) * 100
            
            if compression_ratio < 0:
                
                return "0%"
            elif compression_ratio > 95:
                return ">95%"
            else:
                
                return f"{round(compression_ratio)}%"
                
        except Exception as e:
            return "0%"
    
    def _get_bits_per_pixel(self, mode):
        bits_map = {
            '1': 1,      
            'L': 8,      
            'P': 8,      
            'RGB': 24,   
            'RGBA': 32,  
            'CMYK': 32,  
            'YCbCr': 24, 
            'LAB': 24,   
            'HSV': 24,   
            'I': 32,     
            'F': 32,     
            'LA': 16,    
            'PA': 16     
        }
        return bits_map.get(mode, 24)  
    
    def _get_bmp_info(self, file_path, file_size_kb):
        try:
            with open(file_path, 'rb') as f:
                
                header = f.read(54)
                if len(header) < 54:
                    raise ValueError("Неверный формат BMP файла")
                
                
                if header[0:2] != b'BM':
                    raise ValueError("Неверная сигнатура BMP")
                
                
                file_size_from_header = struct.unpack('<I', header[2:6])[0]
                
                
                data_offset = struct.unpack('<I', header[10:14])[0]
                
                
                header_size = struct.unpack('<I', header[14:18])[0]
                
                
                if header_size == 12:  
                    width = struct.unpack('<H', header[18:20])[0]
                    height = struct.unpack('<H', header[20:22])[0]
                    planes = struct.unpack('<H', header[22:24])[0]
                    bit_count = struct.unpack('<H', header[24:26])[0]
                    compression = 0  
                else:  
                    width = struct.unpack('<i', header[18:22])[0]
                    height = struct.unpack('<i', header[22:26])[0]
                    planes = struct.unpack('<H', header[26:28])[0]
                    bit_count = struct.unpack('<H', header[28:30])[0]
                    compression = struct.unpack('<I', header[30:34])[0]
                
                
                if header_size >= 40:
                    
                    ppm_x = struct.unpack('<i', header[38:42])[0]
                    ppm_y = struct.unpack('<i', header[42:46])[0]
                    
                    
                    dpi_x = int(ppm_x / 39.3701) if ppm_x > 0 else 96
                    dpi_y = int(ppm_y / 39.3701) if ppm_y > 0 else 96
                else:
                    dpi_x = dpi_y = 96
                
                
                file_size = os.path.getsize(file_path)
                uncompressed_size = width * height * (bit_count / 8) + data_offset
                compression_ratio = (1 - (file_size / uncompressed_size)) * 100 if uncompressed_size > 0 else 0
                
                
                compression_types = {
                    0: "BI_RGB",
                    1: "BI_RLE8",
                    2: "BI_RLE4", 
                    3: "BI_BITFIELDS",
                    4: "BI_JPEG",
                    5: "BI_PNG",
                    6: "BI_ALPHABITFIELDS"
                }
                
                compression_name = compression_types.get(compression, f"Unknown ({compression})")
                
                info = {
                    'filename': os.path.basename(file_path),
                    'file_size': f"{file_size_kb:.1f} KB",
                    'format': 'BMP',
                    'size': f"{abs(width)}×{abs(height)}",
                    'mode': self._get_bmp_mode(bit_count),
                    'color_depth': bit_count,
                    'dpi': f"{dpi_x}×{dpi_y}",
                    'compression': f"{round(compression_ratio)}%" if compression_ratio >= 0 else "0%",
                    'compression_type': compression_name,
                    'format_specific': f"BMP, заголовок: {header_size} байт"
                }
                
                return info
                
        except Exception as e:
            
            try:
                with Image.open(file_path) as img:
                    file_size = os.path.getsize(file_path)
                    compression_ratio = self._calculate_compression_ratio(img, file_size)
                    
                    info = {
                        'filename': os.path.basename(file_path),
                        'file_size': f"{file_size_kb:.1f} KB",
                        'format': img.format,
                        'size': f"{img.size[0]}×{img.size[1]}",
                        'mode': img.mode,
                        'color_depth': self._get_color_depth(img.mode),
                        'compression': compression_ratio,
                        'compression_type': 'None',
                        'format_specific': 'BMP (через PIL)'
                    }
                    
                    dpi_x, dpi_y = self._get_dpi(img)
                    info['dpi'] = f"{dpi_x}×{dpi_y}"
                    
                    return info
            except:
                return {
                    'filename': os.path.basename(file_path),
                    'file_size': f"{file_size_kb:.1f} KB",
                    'error': f"Ошибка чтения BMP: {str(e)}",
                    'size': 'N/A',
                    'dpi': 'N/A',
                    'color_depth': 'N/A',
                    'compression': 'N/A',
                    'compression_type': 'N/A',
                    'format_specific': ''
                }
    
    def _get_bmp_mode(self, bit_count):
        mode_map = {
            1: '1',      
            4: 'P',      
            8: 'P',      
            16: 'RGB',   
            24: 'RGB',   
            32: 'RGBA'   
        }
        return mode_map.get(bit_count, 'Unknown')
    
    def _get_dpi(self, img):
        dpi_x = 96
        dpi_y = 96
        
        try:
            if hasattr(img, 'info'):
                
                if 'dpi' in img.info and img.info['dpi']:
                    dpi_x, dpi_y = img.info['dpi']
                elif 'jfif_density' in img.info and img.info['jfif_density']:
                    dpi_x, dpi_y = img.info['jfif_density']
                elif 'resolution' in img.info and img.info['resolution']:
                    dpi_x, dpi_y = img.info['resolution']
                
                
                if dpi_x == 0 or dpi_y == 0:
                    dpi_x, dpi_y = 96, 96
                    
        except:
            dpi_x, dpi_y = 96, 96
            
        return int(dpi_x), int(dpi_y)
    
    def _get_color_depth(self, mode):
        depth_map = {
            '1': 1, 'L': 8, 'P': 8, 'RGB': 24, 'RGBA': 32,
            'CMYK': 32, 'YCbCr': 24, 'LAB': 24, 'HSV': 24,
            'I': 32, 'F': 32, 'LA': 16, 'PA': 16
        }
        return depth_map.get(mode, 'N/A')
    
    def _get_compression_type(self, img, file_path):
        try:
            compression_info = "N/A"
            
            
            if img.format == 'JPEG':
                compression_info = "JPEG"
                jpeg_details = []
                
                if hasattr(img, 'quality') and img.quality:
                    jpeg_details.append(f"качество: {img.quality}")
                else:
                    quality = img.info.get('quality', None)
                    if quality:
                        jpeg_details.append(f"качество: {quality}")
                
                if hasattr(img, 'progressive') and img.progressive:
                    jpeg_details.append("прогрессивный")
                else:
                    progressive = img.info.get('progressive', False)
                    if progressive:
                        jpeg_details.append("прогрессивный")
                    else:
                        jpeg_details.append("базовый")
                
                if jpeg_details:
                    compression_info += f" ({', '.join(jpeg_details)})"
            
            
            elif img.format == 'PNG':
                compression_info = "Deflate"
                if 'compression' in img.info:
                    comp_level = img.info.get('compression', 'N/A')
                    compression_info += f" (уровень: {comp_level})"
            
            
            elif img.format == 'TIFF':
                compression_info = self._get_tiff_compression(img)
            
            
            elif img.format == 'GIF':
                compression_info = "LZW"
            
            
            elif img.format == 'BMP':
                compression_info = "None"
                
            
            elif img.format == 'PCX':
                compression_info = "RLE"
            
            return compression_info
            
        except Exception as e:
            return f"Error: {str(e)}"
    
    def _get_tiff_compression(self, img):
        try:
            if hasattr(img, 'tag_v2'):
                if 259 in img.tag_v2:
                    tiff_compression = img.tag_v2[259]
                    compression_names = {
                        1: 'None', 
                        2: 'CCITT RLE', 
                        3: 'CCITT Fax3', 
                        4: 'CCITT Fax4', 
                        5: 'LZW', 
                        6: 'JPEG', 
                        7: 'PackBits', 
                        8: 'Deflate',
                        32946: 'Deflate',
                        34712: 'JPEG 2000'
                    }
                    comp_name = compression_names.get(tiff_compression, f'Unknown ({tiff_compression})')
                    return f"TIFF {comp_name}"
            
            return "TIFF Unknown"
        except:
            return "TIFF"
    
    def _get_format_specific_info(self, img, file_path):
        format_specific = {}
        
        try:
            if img.format == 'JPEG':
                jpeg_info = []
                
                quality = None
                if hasattr(img, 'quality') and img.quality:
                    quality = img.quality
                elif 'quality' in img.info:
                    quality = img.info['quality']
                
                if quality:
                    jpeg_info.append(f"качество: {quality}")
                
                if hasattr(img, 'progressive') and img.progressive:
                    jpeg_info.append("прогрессивный")
                elif 'progressive' in img.info and img.info['progressive']:
                    jpeg_info.append("прогрессивный")
                else:
                    jpeg_info.append("базовый")
                
                if 'exif' in img.info:
                    exif_size = len(img.info['exif'])
                    jpeg_info.append(f"EXIF: {exif_size} байт")
                
                format_specific['jpeg_info'] = ", ".join(jpeg_info)
                
            elif img.format == 'GIF':
                gif_info = []
                try:
                    if hasattr(img, 'is_animated') and img.is_animated:
                        gif_info.append(f"кадров: {img.n_frames}")
                    else:
                        gif_info.append("статичный")
                    
                    if img.mode == 'P' and hasattr(img, 'palette'):
                        try:
                            colors = len(img.getcolors()) if img.getcolors() else '?'
                            gif_info.append(f"цветов: {colors}")
                        except:
                            gif_info.append("палитровый")
                    
                    format_specific['gif_info'] = ", ".join(gif_info)
                except:
                    format_specific['gif_info'] = "GIF информация"
                    
            elif img.format == 'TIFF':
                tiff_info = []
                try:
                    if hasattr(img, 'tag_v2'):
                        tags_count = len(img.tag_v2)
                        tiff_info.append(f"тегов: {tags_count}")
                    
                    if hasattr(img, 'n_frames') and img.n_frames > 1:
                        tiff_info.append(f"страниц: {img.n_frames}")
                    
                    format_specific['tiff_info'] = ", ".join(tiff_info)
                except:
                    format_specific['tiff_info'] = "TIFF информация"
            
            elif img.format == 'PNG':
                png_info = []
                if 'gamma' in img.info:
                    png_info.append(f"гамма: {img.info['gamma']:.3f}")
                
                if 'transparency' in img.info:
                    png_info.append("прозрачность")
                
                if 'compression' in img.info:
                    png_info.append(f"уровень: {img.info['compression']}")
                
                format_specific['png_info'] = ", ".join(png_info) if png_info else "PNG"
            
            elif img.format == 'BMP':
                bmp_info = []
                try:
                    with Image.open(file_path) as bmp_img:
                        if bmp_img.mode == 'P':
                            bmp_info.append("палитровый")
                        else:
                            bmp_info.append("непосредственные цвета")
                    format_specific['bmp_info'] = ", ".join(bmp_info)
                except:
                    format_specific['bmp_info'] = "Bitmap"
                
            elif img.format == 'PCX':
                format_specific['pcx_info'] = "PC Paintbrush"
        
        except Exception as e:
            format_specific['error'] = f"Ошибка: {str(e)}"
        
        return {'format_specific': ", ".join([f"{v}" for v in format_specific.values()])}


class ImageInfoApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Анализатор графических файлов v3.0")
        self.root.geometry("1400x800")
        
        self.extractor = ImageInfoExtractor()
        self.files_to_process = []
        self.current_processing = False
        
        self.setup_ui()
    
    def setup_ui(self):
        
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
        
        
        title_label = ttk.Label(main_frame, 
                               text="Анализатор графических файлов", 
                               font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, columnspan=4, pady=(0, 20))
        
        
        folder_frame = ttk.Frame(main_frame)
        folder_frame.grid(row=1, column=0, columnspan=4, sticky=(tk.W, tk.E), pady=(0, 10))
        folder_frame.columnconfigure(1, weight=1)
        
        ttk.Label(folder_frame, text="Папка с изображениями:").grid(row=0, column=0, sticky=tk.W)
        
        self.folder_path = tk.StringVar()
        self.folder_entry = ttk.Entry(folder_frame, textvariable=self.folder_path, width=70)
        self.folder_entry.grid(row=0, column=1, padx=(10, 10), sticky=(tk.W, tk.E))
        
        ttk.Button(folder_frame, text="Обзор", command=self.browse_folder).grid(row=0, column=2, padx=(0, 10))
        ttk.Button(folder_frame, text="Сканировать", command=self.scan_folder).grid(row=0, column=3)
        
        
        self.status_var = tk.StringVar(value="Готов к работе")
        status_bar = ttk.Label(main_frame, textvariable=self.status_var, relief=tk.SUNKEN)
        status_bar.grid(row=3, column=0, columnspan=4, sticky=(tk.W, tk.E), pady=(10, 0))
        
        
        self.progress = ttk.Progressbar(main_frame, mode='determinate')
        self.progress.grid(row=4, column=0, columnspan=4, sticky=(tk.W, tk.E), pady=(5, 0))
        
        
        columns = ('filename', 'file_size', 'size', 'dpi', 'color_depth', 'compression', 'compression_type', 'format_specific')
        self.tree = ttk.Treeview(main_frame, columns=columns, show='headings', height=25)
        
        
        self.tree.heading('filename', text='Имя файла')
        self.tree.heading('file_size', text='Размер файла')
        self.tree.heading('size', text='Размер изображения')
        self.tree.heading('dpi', text='Разрешение (DPI)')
        self.tree.heading('color_depth', text='Глубина цвета')
        self.tree.heading('compression', text='Сжатие %')
        self.tree.heading('compression_type', text='Тип сжатия')
        self.tree.heading('format_specific', text='Доп. информация')
        
        
        self.tree.column('filename', width=180, anchor=tk.W)
        self.tree.column('file_size', width=90, anchor=tk.CENTER)
        self.tree.column('size', width=100, anchor=tk.CENTER)
        self.tree.column('dpi', width=90, anchor=tk.CENTER)
        self.tree.column('color_depth', width=90, anchor=tk.CENTER)
        self.tree.column('compression', width=80, anchor=tk.CENTER)
        self.tree.column('compression_type', width=150, anchor=tk.CENTER)
        self.tree.column('format_specific', width=250, anchor=tk.W)
        
        
        scrollbar = ttk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.grid(row=2, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(10, 0))
        scrollbar.grid(row=2, column=3, sticky=(tk.N, tk.S), pady=(10, 0))
        
        
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=5, column=0, columnspan=4, pady=(10, 0), sticky=(tk.W, tk.E))
        
        ttk.Button(button_frame, text="Экспорт в CSV", command=self.export_to_csv).grid(row=0, column=0, padx=(0, 10))
        ttk.Button(button_frame, text="Очистить результаты", command=self.clear_results).grid(row=0, column=1)
        ttk.Button(button_frame, text="Остановить обработку", command=self.stop_processing).grid(row=0, column=2)
        
        
        self.file_count_var = tk.StringVar(value="Файлов: 0")
        ttk.Label(button_frame, textvariable=self.file_count_var).grid(row=0, column=3, sticky=tk.E)
        
        
        hint_label = ttk.Label(main_frame, 
                              text="Поддерживаемые форматы: JPG, JPEG, GIF, TIF, TIFF, BMP, PNG, PCX | Сжатие: % экономии места", 
                              font=("Arial", 9), 
                              foreground="gray")
        hint_label.grid(row=6, column=0, columnspan=4, pady=(10, 0))
    
    def browse_folder(self):
        folder_selected = filedialog.askdirectory()
        if folder_selected:
            self.folder_path.set(folder_selected)
    
    def scan_folder(self):
        folder_path = self.folder_path.get()
        if not folder_path or not os.path.exists(folder_path):
            messagebox.showerror("Ошибка", "Пожалуйста, выберите существующую папку")
            return
        
        if self.current_processing:
            messagebox.showwarning("Внимание", "Идет обработка файлов. Дождитесь завершения.")
            return
        
        
        self.files_to_process = []
        
        for root_dir, dirs, files in os.walk(folder_path):
            for file in files:
                if len(self.files_to_process) >= 100000:  
                    break
                ext = os.path.splitext(file)[1].lower()
                if ext in self.extractor.supported_formats:
                    self.files_to_process.append(os.path.join(root_dir, file))
        
        self.file_count_var.set(f"Найдено файлов: {len(self.files_to_process)}")
        
        if not self.files_to_process:
            messagebox.showinfo("Информация", "В выбранной папке не найдено графических файлов поддерживаемых форматов.")
            return
        
        
        self.current_processing = True
        threading.Thread(target=self.process_files, daemon=True).start()
    
    def process_files(self):
        start_time = datetime.now()
        
        
        self.root.after(0, self.clear_results)
        
        
        self.progress['maximum'] = len(self.files_to_process)
        self.progress['value'] = 0
        
        processed_count = 0
        
        for file_path in self.files_to_process:
            if not self.current_processing:  
                break
                
            info = self.extractor.get_image_info(file_path)
            
            
            self.root.after(0, self.add_tree_item, info)
            
            processed_count += 1
            self.progress['value'] = processed_count
            
            
            if processed_count % 10 == 0 or processed_count == len(self.files_to_process):
                status = f"Обработано: {processed_count}/{len(self.files_to_process)}"
                self.root.after(0, lambda: self.status_var.set(status))
        
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        
        if self.current_processing:
            final_status = f"Обработка завершена. Файлов: {processed_count}. Время: {processing_time:.2f} сек."
            self.root.after(0, lambda: self.status_var.set(final_status))
            self.root.after(0, lambda: self.file_count_var.set(f"Обработано: {processed_count} файлов"))
        
        self.current_processing = False
    
    def add_tree_item(self, info):
        color_depth = info.get('color_depth', 'N/A')
        if color_depth != 'N/A':
            color_depth = f"{color_depth} бит"
        
        
        compression = info.get('compression', '0%')
        if compression.endswith('.0%'):
            compression = compression.replace('.0%', '%')
        
        values = (
            info.get('filename', 'N/A'),
            info.get('file_size', 'N/A'),
            info.get('size', 'N/A'),
            info.get('dpi', 'N/A'),
            color_depth,
            compression,  
            info.get('compression_type', 'N/A'),
            info.get('format_specific', '')
        )
        self.tree.insert('', tk.END, values=values)
    
    def clear_results(self):
        self.tree.delete(*self.tree.get_children())
    
    def stop_processing(self):
        if self.current_processing:
            self.current_processing = False
            self.status_var.set("Обработка остановлена пользователем")
    
    def export_to_csv(self):
        if not self.tree.get_children():
            messagebox.showwarning("Внимание", "Нет данных для экспорта")
            return
        
        filename = filedialog.asksaveasfilename(
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if filename:
            try:
                with open(filename, 'w', encoding='utf-8-sig') as f:
                    
                    headers = ['Имя файла', 'Размер файла', 'Размер изображения', 'Разрешение (DPI)', 
                              'Глубина цвета', 'Сжатие %', 'Тип сжатия', 'Доп. информация']
                    f.write(';'.join(headers) + '\n')
                    
                    
                    for item in self.tree.get_children():
                        values = self.tree.item(item)['values']
                        
                        escaped_values = [f'"{v}"' if ';' in str(v) else str(v) for v in values]
                        f.write(';'.join(escaped_values) + '\n')
                
                messagebox.showinfo("Успех", f"Данные экспортированы в {filename}")
            except Exception as e:
                messagebox.showerror("Ошибка", f"Не удалось экспортировать данные: {str(e)}")


def main():
    root = tk.Tk()
    app = ImageInfoApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()