using AlphaTab.WinForms;

namespace AlphaTab.Samples.WinForms
{
    partial class MainWindow
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.toolStripContainer1 = new System.Windows.Forms.ToolStripContainer();
            this.alphaTabControl1 = new AlphaTab.WinForms.AlphaTabControl();
            this.mainToolBar = new System.Windows.Forms.ToolStrip();
            this.openFileButton = new System.Windows.Forms.ToolStripButton();
            this.playPauseButton = new System.Windows.Forms.ToolStripButton();
            this.showScoreInfo = new System.Windows.Forms.ToolStripButton();
            this.splitContainer1 = new System.Windows.Forms.SplitContainer();
            this.panel2 = new System.Windows.Forms.Panel();
            this.tableLayoutPanel2 = new System.Windows.Forms.TableLayoutPanel();
            this.panel3 = new System.Windows.Forms.Panel();
            this.trackDetails = new System.Windows.Forms.Panel();
            this.trackHeaderControl1 = new AlphaTab.Samples.WinForms.TrackHeaderControl();
            this.trackBars = new System.Windows.Forms.Panel();
            this.toolStripContainer1.ContentPanel.SuspendLayout();
            this.toolStripContainer1.TopToolStripPanel.SuspendLayout();
            this.toolStripContainer1.SuspendLayout();
            this.mainToolBar.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).BeginInit();
            this.splitContainer1.Panel1.SuspendLayout();
            this.splitContainer1.Panel2.SuspendLayout();
            this.splitContainer1.SuspendLayout();
            this.panel2.SuspendLayout();
            this.tableLayoutPanel2.SuspendLayout();
            this.panel3.SuspendLayout();
            this.SuspendLayout();
            //
            // toolStripContainer1
            //
            //
            // toolStripContainer1.ContentPanel
            //
            this.toolStripContainer1.ContentPanel.Controls.Add(this.alphaTabControl1);
            this.toolStripContainer1.ContentPanel.Size = new System.Drawing.Size(891, 318);
            this.toolStripContainer1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.toolStripContainer1.LeftToolStripPanelVisible = false;
            this.toolStripContainer1.Location = new System.Drawing.Point(0, 0);
            this.toolStripContainer1.Name = "toolStripContainer1";
            this.toolStripContainer1.RightToolStripPanelVisible = false;
            this.toolStripContainer1.Size = new System.Drawing.Size(891, 359);
            this.toolStripContainer1.TabIndex = 0;
            //
            // toolStripContainer1.TopToolStripPanel
            //
            this.toolStripContainer1.TopToolStripPanel.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(76)))), ((int)(((byte)(76)))), ((int)(((byte)(76)))));
            this.toolStripContainer1.TopToolStripPanel.Controls.Add(this.mainToolBar);
            this.toolStripContainer1.TopToolStripPanel.RenderMode = System.Windows.Forms.ToolStripRenderMode.System;
            //
            // alphaTabControl1
            //
            this.alphaTabControl1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(97)))), ((int)(((byte)(99)))), ((int)(((byte)(98)))));
            this.alphaTabControl1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.alphaTabControl1.ForeColor = System.Drawing.Color.WhiteSmoke;
            this.alphaTabControl1.Location = new System.Drawing.Point(0, 0);
            this.alphaTabControl1.Name = "alphaTabControl1";
            this.alphaTabControl1.Padding = new System.Windows.Forms.Padding(10);
            this.alphaTabControl1.Size = new System.Drawing.Size(891, 318);
            this.alphaTabControl1.TabIndex = 0;
            this.alphaTabControl1.Text = "alphaTabControl1";
            //
            // mainToolBar
            //
            this.mainToolBar.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(76)))), ((int)(((byte)(76)))), ((int)(((byte)(76)))));
            this.mainToolBar.Dock = System.Windows.Forms.DockStyle.None;
            this.mainToolBar.ImageScalingSize = new System.Drawing.Size(24, 24);
            this.mainToolBar.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.openFileButton,
            this.showScoreInfo,
            this.playPauseButton});
            this.mainToolBar.LayoutStyle = System.Windows.Forms.ToolStripLayoutStyle.Flow;
            this.mainToolBar.Location = new System.Drawing.Point(3, 0);
            this.mainToolBar.Name = "mainToolBar";
            this.mainToolBar.Padding = new System.Windows.Forms.Padding(5);
            this.mainToolBar.RenderMode = System.Windows.Forms.ToolStripRenderMode.System;
            this.mainToolBar.Size = new System.Drawing.Size(189, 41);
            this.mainToolBar.TabIndex = 0;
            //
            // openFileButton
            //
            this.openFileButton.DisplayStyle = System.Windows.Forms.ToolStripItemDisplayStyle.Image;
            this.openFileButton.Image = global::AlphaTab.Samples.WinForms.Properties.Resources.folder_page_white;
            this.openFileButton.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.openFileButton.Name = "openFileButton";
            this.openFileButton.Size = new System.Drawing.Size(28, 28);
            this.openFileButton.Text = "Open File";
            this.openFileButton.Click += new System.EventHandler(this.openFileButton_Click);
            //
            // playPauseButton
            //
            this.playPauseButton.DisplayStyle = System.Windows.Forms.ToolStripItemDisplayStyle.Image;
            this.playPauseButton.Image = global::AlphaTab.Samples.WinForms.Properties.Resources.control_play;
            this.playPauseButton.Name = "playPauseButton";
            this.playPauseButton.Size = new System.Drawing.Size(28, 28);
            this.playPauseButton.Text = "Play/Pause";
            this.playPauseButton.Click += new System.EventHandler(this.playPauseButton_Click);
            //
            // showScoreInfo
            //
            this.showScoreInfo.DisplayStyle = System.Windows.Forms.ToolStripItemDisplayStyle.Image;
            this.showScoreInfo.Enabled = false;
            this.showScoreInfo.Image = global::AlphaTab.Samples.WinForms.Properties.Resources.information;
            this.showScoreInfo.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.showScoreInfo.Name = "showScoreInfo";
            this.showScoreInfo.Size = new System.Drawing.Size(28, 28);
            this.showScoreInfo.Text = "Show Score Info";
            this.showScoreInfo.Click += new System.EventHandler(this.showScoreInfo_Click);
            //
            // splitContainer1
            //
            this.splitContainer1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainer1.FixedPanel = System.Windows.Forms.FixedPanel.Panel2;
            this.splitContainer1.Location = new System.Drawing.Point(0, 0);
            this.splitContainer1.Name = "splitContainer1";
            this.splitContainer1.Orientation = System.Windows.Forms.Orientation.Horizontal;
            //
            // splitContainer1.Panel1
            //
            this.splitContainer1.Panel1.Controls.Add(this.toolStripContainer1);
            //
            // splitContainer1.Panel2
            //
            this.splitContainer1.Panel2.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(93)))), ((int)(((byte)(95)))), ((int)(((byte)(94)))));
            this.splitContainer1.Panel2.Controls.Add(this.panel2);
            this.splitContainer1.Size = new System.Drawing.Size(891, 590);
            this.splitContainer1.SplitterDistance = 359;
            this.splitContainer1.TabIndex = 2;
            //
            // panel2
            //
            this.panel2.AutoScroll = true;
            this.panel2.Controls.Add(this.tableLayoutPanel2);
            this.panel2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panel2.Location = new System.Drawing.Point(0, 0);
            this.panel2.Name = "panel2";
            this.panel2.Size = new System.Drawing.Size(891, 227);
            this.panel2.TabIndex = 1;
            //
            // tableLayoutPanel2
            //
            this.tableLayoutPanel2.AutoSize = true;
            this.tableLayoutPanel2.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.tableLayoutPanel2.ColumnCount = 2;
            this.tableLayoutPanel2.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 420F));
            this.tableLayoutPanel2.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle());
            this.tableLayoutPanel2.Controls.Add(this.panel3, 0, 0);
            this.tableLayoutPanel2.Controls.Add(this.trackBars, 1, 0);
            this.tableLayoutPanel2.Dock = System.Windows.Forms.DockStyle.Top;
            this.tableLayoutPanel2.Location = new System.Drawing.Point(0, 0);
            this.tableLayoutPanel2.Name = "tableLayoutPanel2";
            this.tableLayoutPanel2.RowCount = 1;
            this.tableLayoutPanel2.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel2.Size = new System.Drawing.Size(891, 39);
            this.tableLayoutPanel2.TabIndex = 0;
            //
            // panel3
            //
            this.panel3.AutoSize = true;
            this.panel3.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.panel3.Controls.Add(this.trackDetails);
            this.panel3.Controls.Add(this.trackHeaderControl1);
            this.panel3.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panel3.Location = new System.Drawing.Point(0, 0);
            this.panel3.Margin = new System.Windows.Forms.Padding(0);
            this.panel3.Name = "panel3";
            this.panel3.Size = new System.Drawing.Size(420, 39);
            this.panel3.TabIndex = 1;
            //
            // trackDetails
            //
            this.trackDetails.AutoSize = true;
            this.trackDetails.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.trackDetails.Dock = System.Windows.Forms.DockStyle.Fill;
            this.trackDetails.Location = new System.Drawing.Point(0, 39);
            this.trackDetails.Margin = new System.Windows.Forms.Padding(0);
            this.trackDetails.Name = "trackDetails";
            this.trackDetails.Size = new System.Drawing.Size(420, 0);
            this.trackDetails.TabIndex = 0;
            //
            // trackHeaderControl1
            //
            this.trackHeaderControl1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(117)))), ((int)(((byte)(118)))), ((int)(((byte)(119)))));
            this.trackHeaderControl1.Dock = System.Windows.Forms.DockStyle.Top;
            this.trackHeaderControl1.Location = new System.Drawing.Point(0, 0);
            this.trackHeaderControl1.Name = "trackHeaderControl1";
            this.trackHeaderControl1.Size = new System.Drawing.Size(420, 39);
            this.trackHeaderControl1.TabIndex = 0;
            //
            // trackBars
            //
            this.trackBars.AutoSize = true;
            this.trackBars.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.trackBars.Dock = System.Windows.Forms.DockStyle.Top;
            this.trackBars.Location = new System.Drawing.Point(420, 0);
            this.trackBars.Margin = new System.Windows.Forms.Padding(0);
            this.trackBars.Name = "trackBars";
            this.trackBars.Padding = new System.Windows.Forms.Padding(0, 39, 0, 0);
            this.trackBars.Size = new System.Drawing.Size(471, 39);
            this.trackBars.TabIndex = 2;
            //
            // MainWindow
            //
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(891, 590);
            this.Controls.Add(this.splitContainer1);
            this.Name = "MainWindow";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "AlphaTab";
            this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
            this.toolStripContainer1.ContentPanel.ResumeLayout(false);
            this.toolStripContainer1.TopToolStripPanel.ResumeLayout(false);
            this.toolStripContainer1.TopToolStripPanel.PerformLayout();
            this.toolStripContainer1.ResumeLayout(false);
            this.toolStripContainer1.PerformLayout();
            this.mainToolBar.ResumeLayout(false);
            this.mainToolBar.PerformLayout();
            this.splitContainer1.Panel1.ResumeLayout(false);
            this.splitContainer1.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).EndInit();
            this.splitContainer1.ResumeLayout(false);
            this.panel2.ResumeLayout(false);
            this.panel2.PerformLayout();
            this.tableLayoutPanel2.ResumeLayout(false);
            this.tableLayoutPanel2.PerformLayout();
            this.panel3.ResumeLayout(false);
            this.panel3.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.ToolStripContainer toolStripContainer1;
        private System.Windows.Forms.ToolStrip mainToolBar;
        private System.Windows.Forms.ToolStripButton showScoreInfo;
        private System.Windows.Forms.SplitContainer splitContainer1;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel2;
        private System.Windows.Forms.Panel panel2;
        private System.Windows.Forms.Panel trackDetails;
        private System.Windows.Forms.Panel panel3;
        private TrackHeaderControl trackHeaderControl1;
        private System.Windows.Forms.Panel trackBars;
        private System.Windows.Forms.ToolStripButton openFileButton;
        private System.Windows.Forms.ToolStripButton playPauseButton;
        private AlphaTabControl alphaTabControl1;
    }
}

