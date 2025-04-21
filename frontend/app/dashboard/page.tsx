import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoPlayer } from "@/components/video-player"
import { ProcessingStatus } from "@/components/processing-status"

export default function DashboardPage() {
  return (
    <div className="container py-10 md:py-16 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Your Dashboard</h1>
          <p className="text-muted-foreground mt-2">Track and manage your sign language conversions</p>
        </div>
        <Button>New Conversion</Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <CardTitle>Interview_with_CEO.mp4</CardTitle>
                    <CardDescription>Uploaded 10 minutes ago</CardDescription>
                  </div>
                  <Badge className="w-fit">Processing</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ProcessingStatus
                  steps={[
                    { name: "Upload", status: "complete" },
                    { name: "Transcription", status: "complete" },
                    { name: "Translation", status: "in-progress" },
                    { name: "Avatar Generation", status: "pending" },
                    { name: "Finalization", status: "pending" },
                  ]}
                />
                <div className="flex justify-end mt-4">
                  <Button variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <CardTitle>Product_Launch_Announcement.mp3</CardTitle>
                    <CardDescription>Uploaded 45 minutes ago</CardDescription>
                  </div>
                  <Badge className="w-fit bg-amber-500">Finalizing</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ProcessingStatus
                  steps={[
                    { name: "Upload", status: "complete" },
                    { name: "Transcription", status: "complete" },
                    { name: "Translation", status: "complete" },
                    { name: "Avatar Generation", status: "complete" },
                    { name: "Finalization", status: "in-progress" },
                  ]}
                />
                <div className="flex justify-end mt-4">
                  <Button variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Welcome_Message.mp4</CardTitle>
                    <CardDescription>Completed yesterday</CardDescription>
                  </div>
                  <Badge className="bg-green-600">Completed</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <VideoPlayer />
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline">Download</Button>
                  <Button>View</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Company_Update.mp3</CardTitle>
                    <CardDescription>Completed 3 days ago</CardDescription>
                  </div>
                  <Badge className="bg-green-600">Completed</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <VideoPlayer />
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline">Download</Button>
                  <Button>View</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-4">
            <p className="text-muted-foreground">Showing all 10 conversions</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* This would be a map of all conversions */}
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">File_{i + 1}.mp4</CardTitle>
                      <Badge className={i < 2 ? "bg-amber-500" : "bg-green-600"}>
                        {i < 2 ? "Processing" : "Completed"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {i < 2 ? `Uploaded ${i + 1} hour(s) ago` : `Completed ${i} day(s) ago`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="outline" size="sm">
                        {i < 2 ? "Cancel" : "Download"}
                      </Button>
                      {i >= 2 && <Button size="sm">View</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
